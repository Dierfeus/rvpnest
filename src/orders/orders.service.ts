import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Order } from './order.model';
import { OrderItem } from './order-item.model';
import { OrderDelivery } from './order-delivery.model';
import { OrderStatus } from './order-status.model';
import { CartService } from '../cart/cart.service';
import { ProductsService } from '../products/products.service';
import { DiscountsService } from '../discounts/discounts.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class OrdersService {
  constructor(
      @InjectModel(Order) private orderRepository: typeof Order,
      @InjectModel(OrderItem) private orderItemRepository: typeof OrderItem,
      @InjectModel(OrderDelivery) private orderDeliveryRepository: typeof OrderDelivery,
      @InjectModel(OrderStatus) private orderStatusRepository: typeof OrderStatus,
      private cartService: CartService,
      private productsService: ProductsService,
      private discountsService: DiscountsService,
      private sequelize: Sequelize,
  ) {}

  async createOrder(dto: CreateOrderDto) {
    const userId = Number(dto.id_buyer);

    // 1. ТОЛЬКО ЧТЕНИЕ - никаких изменений
    const cartItems = await this.cartService.getCart(userId);

    if (!cartItems || cartItems.length === 0) {
      throw new HttpException('Корзина пуста', HttpStatus.BAD_REQUEST);
    }

    // 2. Проверки без изменений
    const stockCheck = await this.productsService.checkMultipleStock(
        cartItems.map(item => ({
          productId: item.id_product,
          quantity: item.quantity
        }))
    );

    if (!stockCheck.available) {
      const errors = stockCheck.insufficient.map(i =>
          `"${i.name}": доступно ${i.available}, требуется ${i.required}`
      ).join('; ');
      throw new HttpException(
          `Недостаточно товара на складе: ${errors}`,
          HttpStatus.BAD_REQUEST
      );
    }

    // 3. Расчеты без изменений
    let subtotal = 0;
    const orderItemsData: {
      id_product: number;
      quantity: number;
      price_at_time: number;
    }[] = [];

    for (const cartItem of cartItems) {
      const product = await this.productsService.getOne(cartItem.id_product);
      const price = Number(product.price);
      subtotal += price * cartItem.quantity;
      orderItemsData.push({
        id_product: cartItem.id_product,
        quantity: cartItem.quantity,
        price_at_time: price,
      });
    }

    let discountAmount = 0;
    let discountId: number | null = null;
    let finalTotal = subtotal;

    const cartDiscount = cartItems.find(i => i.id_discount);
    if (cartDiscount?.id_discount) {
      const discount = await this.discountsService.validateAndGetDiscount(
          cartDiscount.id_discount,
          subtotal,
          userId
      );
      if (discount) {
        discountId = discount.id_discount;
        discountAmount = cartItems.reduce(
            (sum, i) => sum + Number(i.discount_amount || 0),
            0
        );
        finalTotal = subtotal - discountAmount;
      }
    } else if (dto.id_discount) {
      try {
        const discount = await this.discountsService.validateAndGetDiscount(
            dto.id_discount,
            subtotal,
            userId
        );
        if (discount) {
          discountId = discount.id_discount;
          discountAmount = this.calculateDiscountAmount(subtotal, discount);
          finalTotal = subtotal - discountAmount;
        }
      } catch (e) {
        console.warn('Скидка не применена:', e.message);
      }
    }

    // 4. ТОЛЬКО ТЕПЕРЬ - транзакция
    const transaction = await this.sequelize.transaction();

    try {
      // Создаем заказ
      const order = await this.orderRepository.create({
        id_buyer: userId,
        date: new Date(),
        id_discount: discountId,
        subtotal_amount: subtotal,
        discount_amount: discountAmount,
        total_amount: finalTotal,
        shipping_address: dto.shipping_address,
        payment_method: dto.payment_method,
        comment: dto.comment || null,
      } as any, { transaction });

      // Добавляем товары в заказ
      for (const item of orderItemsData) {
        await this.orderItemRepository.create({
          id_order: order.id_order,
          id_product: item.id_product,
          quantity: item.quantity,
          price_at_time: item.price_at_time,
        } as any, { transaction });
      }

      // Уменьшаем склад
      for (const cartItem of cartItems) {
        await this.productsService.decreaseStockWithLock(
            cartItem.id_product,
            cartItem.quantity,
            order.id_order,
            transaction
        );
      }

      // Помечаем корзину как купленную
      await this.cartService.purchaseCartWithTransaction(
          userId,
          cartItems.map(i => i.id_cart),
          transaction
      );

      // Начальный статус
      const initialStatus = await this.orderStatusRepository.findOne({
        where: { sort_order: 0 }
      });

      if (initialStatus) {
        await this.orderDeliveryRepository.create({
          id_order: order.id_order,
          id_status: initialStatus.id_status,
          date: new Date(),
          comment: 'Заказ создан',
        } as any, { transaction });
      }

      if (discountId) {
        await this.discountsService.incrementUsageCount(discountId, transaction);
      }

      await transaction.commit();

      return this.getOrderById(order.id_order);

    } catch (e) {
      await transaction.rollback();
      throw e;
    }
  }

  async getOrdersByUser(userId: number) {
    return this.orderRepository.findAll({
      where: { id_buyer: userId },
      include: ['buyer', 'discount', 'items', {
        association: 'deliveries',
        include: ['status'],
        order: [['date', 'DESC']]
      }],
      order: [['date', 'DESC']]
    });
  }

  async getOrderById(id: number) {
    const order = await this.orderRepository.findByPk(id, {
      include: [
        'buyer',
        'discount',
        'items',
        {
          association: 'deliveries',
          include: ['status'],
          order: [['date', 'DESC']]
        }
      ]
    });

    if (!order) {
      throw new HttpException('Заказ не найден', HttpStatus.NOT_FOUND);
    }

    return order;
  }

  private calculateDiscountAmount(total: number, discount: any): number {
    let discountAmount = 0;

    if (discount.type === 'percentage') {
      discountAmount = total * (discount.size / 100);
      if (discount.max_discount_amount) {
        discountAmount = Math.min(discountAmount, discount.max_discount_amount);
      }
    } else if (discount.type === 'fixed') {
      discountAmount = discount.size;
    }

    return Math.min(discountAmount, total);
  }

  async getAllOrders(statusId?: number, limit: number = 10, offset: number = 0) {
    const where: any = {};
    if (statusId) {
      where['$deliveries.id_status$'] = statusId;
    }

    return this.orderRepository.findAll({
      where,
      include: ['buyer', 'discount', 'items', {
        association: 'deliveries',
        include: ['status'],
        order: [['date', 'DESC']]
      }],
      limit: Math.min(limit, 100),
      offset,
      order: [['date', 'DESC']]
    });
  }

  async updateOrder(id: number, dto: UpdateOrderDto) {
    const order = await this.getOrderById(id);
    await order.update(dto);
    return this.getOrderById(id);
  }

  async updateOrderStatus(id: number, statusId: number, comment?: string) {
    const order = await this.getOrderById(id);

    const status = await this.orderStatusRepository.findByPk(statusId);
    if (!status) {
      throw new HttpException('Статус не найден', HttpStatus.NOT_FOUND);
    }

    await this.orderDeliveryRepository.create({
      id_order: order.id_order,
      id_status: statusId,
      date: new Date(),
      comment: comment || `Статус изменен на: ${status.name}`,
    } as any);

    return {
      message: 'Статус заказа обновлен',
      newStatus: status
    };
  }

  async getAllStatuses() {
    return this.orderStatusRepository.findAll({
      order: [['sort_order', 'ASC']]
    });
  }

  async deleteOrder(id: number) {
    const order = await this.getOrderById(id);
    await order.destroy();
    return { message: 'Заказ удален' };
  }
}