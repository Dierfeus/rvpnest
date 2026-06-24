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
    const transaction = await this.sequelize.transaction();

    try {
      const cartItems = await this.cartService.getCartItemsByIds(
          dto.id_buyer,
          dto.cartItemIds
      );

      if (cartItems.length === 0) {
        throw new HttpException('Выбранные товары не найдены в корзине', HttpStatus.BAD_REQUEST);
      }

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

      // Сначала пробуем взять скидку из корзины
      const cartDiscount = cartItems.find(item => item.id_discount);
      if (cartDiscount && cartDiscount.id_discount) {
        const discount = await this.discountsService.validateAndGetDiscount(
            cartDiscount.id_discount,
            subtotal,
            dto.id_buyer
        );
        if (discount) {
          discountId = discount.id_discount;
          discountAmount = cartItems.reduce((sum, item) => sum + (item.discount_amount || 0), 0);
          finalTotal = subtotal - discountAmount;
        }
      }

      else if (dto.id_discount) {
        try {
          const discount = await this.discountsService.validateAndGetDiscount(
              dto.id_discount,
              subtotal,
              dto.id_buyer
          );
          if (discount) {
            discountId = discount.id_discount;
            discountAmount = this.calculateDiscountAmount(subtotal, discount);
            finalTotal = subtotal - discountAmount;
          }
        } catch (error) {
          console.warn('Скидка не применена:', error.message);
        }
      }

      const order = await this.orderRepository.create({
        id_seller: dto.id_seller,
        id_buyer: dto.id_buyer,
        date: new Date(),
        id_discount: discountId,
        subtotal_amount: subtotal,
        discount_amount: discountAmount,
        total_amount: finalTotal,
        shipping_address: dto.shipping_address,
        payment_method: dto.payment_method,
        comment: dto.comment || null,
      } as any, { transaction });

      for (const item of orderItemsData) {
        await this.orderItemRepository.create({
          id_order: order.id_order,
          id_product: item.id_product,
          quantity: item.quantity,
          price_at_time: item.price_at_time,
        } as any, { transaction });
      }

      for (const cartItem of cartItems) {
        await this.productsService.decreaseStockWithLock(
            cartItem.id_product,
            cartItem.quantity,
            order.id_order,
            transaction
        );
      }

      await this.cartService.purchaseCartWithTransaction(
          dto.id_buyer,
          dto.cartItemIds,
          transaction
      );

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

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
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
      include: ['seller', 'buyer', 'discount', 'items', {
        association: 'deliveries',
        include: ['status'],
        order: [['date', 'DESC']]
      }],
      limit: Math.min(limit, 100),
      offset,
      order: [['date', 'DESC']]
    });
  }

  async getOrderById(id: number) {
    const order = await this.orderRepository.findByPk(id, {
      include: ['seller', 'buyer', 'discount', 'items', {
        association: 'deliveries',
        include: ['status'],
        order: [['date', 'DESC']]
      }]
    });

    if (!order) {
      throw new HttpException('Заказ не найден', HttpStatus.NOT_FOUND);
    }

    return order;
  }

  async getOrdersByUser(userId: number, role: 'buyer' | 'seller') {
    return this.orderRepository.findAll({
      where: { [role === 'buyer' ? 'id_buyer' : 'id_seller']: userId },
      include: ['seller', 'buyer', 'discount', 'items', {
        association: 'deliveries',
        include: ['status'],
        order: [['date', 'DESC']]
      }],
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