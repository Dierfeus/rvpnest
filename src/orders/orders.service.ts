import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Order } from './order.model';
import { OrderItem } from './order-item.model';
import { OrderDelivery } from './order-delivery.model';
import { OrderStatus } from './order-status.model';
import { CartService } from '../cart/cart.service';
import { ProductsService } from '../products/products.service';
import { DiscountsService } from '../discounts/discounts.service';
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

  async createOrder(dto: any) {
    const userId = Number(dto.id_buyer);

    // getCart теперь возвращает массив объектов, а не моделей
    const cartItems = await this.cartService.getCart(userId);

    if (!cartItems || cartItems.length === 0) {
      throw new HttpException('Корзина пуста', HttpStatus.BAD_REQUEST);
    }

    const stockCheck = await this.productsService.checkMultipleStock(
        cartItems.map(i => ({
          productId: i.id_product,
          quantity: i.quantity,
        })),
    );

    if (!stockCheck.available) {
      throw new HttpException(
          `Недостаточно товара на складе`,
          HttpStatus.BAD_REQUEST,
      );
    }

    let subtotal = 0;
    const orderItems: any[] = [];

    for (const item of cartItems) {
      const product = await this.productsService.getOne(item.id_product);
      const price = Number(product.price);

      subtotal += price * item.quantity;

      orderItems.push({
        id_product: item.id_product,
        quantity: item.quantity,
        price_at_time: price,
      });
    }

    // Берем скидку из корзины
    let discountId: number | null = null;
    let discountAmount = 0;
    let finalTotal = subtotal;

    // Проверяем есть ли скидка в корзине
    const cartDiscount = cartItems.find(i => i.id_discount);

    if (cartDiscount?.id_discount) {
      try {
        const discount = await this.discountsService.getDiscountById(cartDiscount.id_discount);

        if (discount && discount.is_active) {
          const now = new Date();
          const start = new Date(discount.start_time);
          const end = new Date(discount.end_time);

          // Проверяем срок действия
          if (now >= start && now <= end) {
            // Проверяем минимальную сумму
            if (!discount.min_order_amount || subtotal >= Number(discount.min_order_amount)) {
              discountId = discount.id_discount;

              // Суммируем скидку из всех товаров корзины
              discountAmount = cartItems.reduce(
                  (s, i) => s + Number(i.discount_amount || 0),
                  0,
              );

              // Если сумма скидки не распределена по товарам, рассчитываем общую
              if (discountAmount === 0) {
                let calculatedDiscount = 0;
                if (discount.type === 'percentage') {
                  calculatedDiscount = subtotal * (discount.size / 100);
                  if (discount.max_discount_amount) {
                    calculatedDiscount = Math.min(calculatedDiscount, Number(discount.max_discount_amount));
                  }
                } else if (discount.type === 'fixed') {
                  calculatedDiscount = Math.min(discount.size, subtotal);
                }
                discountAmount = calculatedDiscount;
              }

              finalTotal = subtotal - discountAmount;
            }
          }
        }
      } catch (error) {
        console.log('Error getting discount:', error);
      }
    }

    const transaction = await this.sequelize.transaction();

    try {
      const order = await this.orderRepository.create(
          {
            id_buyer: userId,
            date: new Date(),
            id_discount: discountId,
            subtotal_amount: subtotal,
            discount_amount: discountAmount,
            total_amount: finalTotal < 0 ? 0 : finalTotal,
            shipping_address: dto.shipping_address,
            payment_method: dto.payment_method,
            comment: dto.comment || null,
          } as any,
          { transaction },
      );

      const orderId = order.get('id_order') || order.dataValues?.id_order || order.id_order;

      if (!orderId) {
        throw new HttpException('Не удалось получить ID созданного заказа', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      for (const item of orderItems) {
        await this.orderItemRepository.create(
            {
              id_order: orderId,
              ...item,
            } as any,
            { transaction },
        );
      }

      for (const item of cartItems) {
        await this.productsService.decreaseStockWithLock(
            item.id_product,
            item.quantity,
            orderId,
            transaction,
        );
      }

      await this.cartService.purchaseCartWithTransaction(
          userId,
          cartItems.map(i => i.id_cart),
          transaction,
      );

      const status = await this.orderStatusRepository.findOne({
        where: { sort_order: 0 },
      });

      if (status) {
        await this.orderDeliveryRepository.create(
            {
              id_order: orderId,
              id_status: status.id_status,
              date: new Date(),
              comment: 'Заказ создан',
            } as any,
            { transaction },
        );
      }

      // Увеличиваем счетчик использований скидки
      if (discountId) {
        await this.discountsService.incrementUsageCount(discountId, transaction);
      }

      await transaction.commit();

      return this.getOrderById(orderId);
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
      }],
      order: [['date', 'DESC']],
    });
  }

  async getOrderById(id: number) {
    const order = await this.orderRepository.findByPk(id, {
      include: ['buyer', 'discount', 'items', {
        association: 'deliveries',
        include: ['status'],
      }],
    });

    if (!order) {
      throw new HttpException('Заказ не найден', HttpStatus.NOT_FOUND);
    }

    return order;
  }

  async getAllOrders(statusId?: number, limit = 10, offset = 0) {
    const where: any = {};

    if (statusId) {
      where['$deliveries.id_status$'] = statusId;
    }

    return this.orderRepository.findAll({
      where,
      include: ['buyer', 'discount', 'items', {
        association: 'deliveries',
        include: ['status'],
      }],
      limit: Math.min(limit, 100),
      offset,
      order: [['date', 'DESC']],
    });
  }

  async getAllStatuses() {
    return this.orderStatusRepository.findAll({
      order: [['sort_order', 'ASC']],
    });
  }

  async updateOrder(id: number, dto: any) {
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
      comment: comment || `Статус: ${status.name}`,
    } as any);

    return { message: 'OK', status };
  }

  async deleteOrder(id: number) {
    const order = await this.getOrderById(id);
    await order.destroy();
    return { message: 'Заказ удалён' };
  }
}