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

    let discountId: number | null = null;
    let discountAmount = 0;
    let finalTotal = subtotal;

    const cartDiscount = cartItems.find(i => i.id_discount);

    if (cartDiscount?.id_discount) {
      try {
        const discount = await this.discountsService.getDiscountById(cartDiscount.id_discount);

        if (discount && discount.is_active) {
          const now = new Date();
          const start = new Date(discount.start_time);
          const end = new Date(discount.end_time);

          if (now >= start && now <= end) {
            if (!discount.min_order_amount || subtotal >= Number(discount.min_order_amount)) {
              discountId = discount.id_discount;

              discountAmount = cartItems.reduce(
                  (s, i) => s + Number(i.discount_amount || 0),
                  0,
              );

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

      const initialStatus = await this.orderStatusRepository.findOne({
        where: { sort_order: 0 },
      });

      if (initialStatus) {
        await this.orderDeliveryRepository.create(
            {
              id_order: orderId,
              id_status: initialStatus.id_status,
              date: new Date(),
              comment: 'Заказ создан, ожидает подтверждения',
            } as any,
            { transaction },
        );
      }

      if (discountId) {
        await this.discountsService.incrementUsageCount(discountId, transaction);
      }

      await transaction.commit();

      return this.getOrderWithStatus(orderId);
    } catch (e) {
      await transaction.rollback();
      throw e;
    }
  }

  async getAllStatuses() {
    return this.orderStatusRepository.findAll({
      order: [['sort_order', 'ASC']],
    });
  }

  async getStatusById(id: number) {
    const status = await this.orderStatusRepository.findByPk(id);
    if (!status) {
      throw new HttpException('Статус не найден', HttpStatus.NOT_FOUND);
    }
    return status;
  }

  async getStatusByName(name: string) {
    const status = await this.orderStatusRepository.findOne({
      where: { name },
    });
    if (!status) {
      throw new HttpException('Статус не найден', HttpStatus.NOT_FOUND);
    }
    return status;
  }

  async updateOrderStatus(id: number, statusId: number, comment?: string) {
    const order = await this.getOrderById(id);
    const status = await this.getStatusById(statusId);

    const currentStatus = await this.getCurrentOrderStatus(id);
    if (currentStatus) {
      const statusObj = await this.getStatusById(currentStatus.id_status);
      if (statusObj && (statusObj.name === 'Доставлен' || statusObj.name === 'Получен' || statusObj.name === 'Отменен')) {
        throw new HttpException('Нельзя изменить статус завершенного заказа', HttpStatus.BAD_REQUEST);
      }
    }

    await this.orderDeliveryRepository.create({
      id_order: order.id_order,
      id_status: statusId,
      date: new Date(),
      comment: comment || `Статус изменен на: ${status.name}`,
    } as any);

    return {
      message: 'Статус заказа обновлен',
      status,
      orderId: order.id_order
    };
  }

  async getCurrentOrderStatus(orderId: number) {
    const delivery = await this.orderDeliveryRepository.findOne({
      where: { id_order: orderId },
      order: [['date', 'DESC']],
      include: ['status'],
    });
    if (!delivery) {
      return null;
    }
    return delivery.status;
  }

  async getOrderStatusHistory(orderId: number) {
    const order = await this.getOrderById(orderId);
    const history = await this.orderDeliveryRepository.findAll({
      where: { id_order: orderId },
      include: ['status'],
      order: [['date', 'DESC']],
    });
    return history;
  }

  async setOrderDelivered(orderId: number, comment?: string) {
    const status = await this.getStatusByName('Доставлен');
    return this.updateOrderStatus(orderId, status.id_status, comment || 'Заказ доставлен');
  }

  async setOrderReceived(orderId: number, comment?: string) {
    const status = await this.getStatusByName('Получен');
    return this.updateOrderStatus(orderId, status.id_status, comment || 'Заказ получен покупателем');
  }

  async setOrderCancelled(orderId: number, comment?: string) {
    const status = await this.getStatusByName('Отменен');
    return this.updateOrderStatus(orderId, status.id_status, comment || 'Заказ отменен');
  }

  async canChangeStatus(orderId: number, newStatusId: number): Promise<boolean> {
    const currentStatus = await this.getCurrentOrderStatus(orderId);
    if (!currentStatus) return true;

    const currentStatusObj = await this.getStatusById(currentStatus.id_status);
    const newStatusObj = await this.getStatusById(newStatusId);

    const finalStatuses = ['Доставлен', 'Получен', 'Отменен', 'Возврат'];
    if (currentStatusObj && finalStatuses.includes(currentStatusObj.name)) {
      return false;
    }

    if (currentStatusObj && newStatusObj && newStatusObj.sort_order < currentStatusObj.sort_order) {
      return false;
    }

    return true;
  }

  async getOrdersByUser(userId: number) {
    const orders = await this.orderRepository.findAll({
      where: { id_buyer: userId },
      include: ['buyer', 'discount', 'items', {
        association: 'deliveries',
        include: ['status'],
        order: [['date', 'DESC']],
      }],
      order: [['date', 'DESC']],
    });
    const result: any[] = [];
    for (const order of orders) {
      const orderWithStatus = await this.getOrderWithStatus(order.id_order);
      result.push(orderWithStatus);
    }
    return result;
  }

  // Метод для получения заказа с текущим статусом (возвращает объект)
  async getOrderWithStatus(id: number) {
    const order = await this.orderRepository.findByPk(id, {
      include: ['buyer', 'discount', 'items', {
        association: 'deliveries',
        include: ['status'],
        order: [['date', 'DESC']],
      }],
    });

    if (!order) {
      throw new HttpException('Заказ не найден', HttpStatus.NOT_FOUND);
    }

    const orderJson = order.toJSON();
    const currentStatus = await this.getCurrentOrderStatus(id);
    return {
      ...orderJson,
      currentStatus: currentStatus || null,  // Убираем .status
    };
  }

  // Метод для получения модели заказа (для внутреннего использования)
  async getOrderById(id: number) {
    const order = await this.orderRepository.findByPk(id, {
      include: ['buyer', 'discount', 'items', {
        association: 'deliveries',
        include: ['status'],
        order: [['date', 'DESC']],
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

    const orders = await this.orderRepository.findAll({
      where,
      include: ['buyer', 'discount', 'items', {
        association: 'deliveries',
        include: ['status'],
        order: [['date', 'DESC']],
      }],
      limit: Math.min(limit, 100),
      offset,
      order: [['date', 'DESC']],
    });

    const result: any[] = [];
    for (const order of orders) {
      const orderJson = order.toJSON();
      const currentStatus = await this.getCurrentOrderStatus(order.id_order);
      result.push({
        ...orderJson,
        currentStatus: currentStatus || null,  // Убираем .status
      });
    }

    return result;
  }

  async updateOrder(id: number, dto: any) {
    const order = await this.getOrderById(id);
    await order.update(dto);

    return this.getOrderWithStatus(id);
  }

  async deleteOrder(id: number) {
    const order = await this.getOrderById(id);
    await order.destroy();
    return { message: 'Заказ удалён' };
  }

  async createStatus(name: string, description: string, sort_order: number) {
    const existing = await this.orderStatusRepository.findOne({
      where: { name }
    });

    if (existing) {
      throw new HttpException('Статус с таким именем уже существует', HttpStatus.BAD_REQUEST);
    }

    const status = await this.orderStatusRepository.create({
      name,
      description: description || null,
      sort_order: sort_order || 0
    } as any);

    return status;
  }
}