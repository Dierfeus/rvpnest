import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Order } from './order.model';
import { OrderItem } from './order-item.model';
import { OrderDelivery } from './order-delivery.model';
import { OrderStatus } from './order-status.model';
import { CartService } from '../cart/cart.service';
import { ProductsService } from '../products/products.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {
  constructor(
      @InjectModel(Order) private orderRepository: typeof Order,
      @InjectModel(OrderItem) private orderItemRepository: typeof OrderItem,
      @InjectModel(OrderDelivery) private orderDeliveryRepository: typeof OrderDelivery,
      @InjectModel(OrderStatus) private orderStatusRepository: typeof OrderStatus,
      private cartService: CartService,
      private productsService: ProductsService,
  ) {}

  async createOrder(dto: CreateOrderDto) {
    // Получаем товары из корзины по id_cart
    const cartItems = await this.cartService.getCartItemsByIds(
        dto.id_buyer,
        dto.cartItemIds
    );

    if (cartItems.length === 0) {
      throw new HttpException('Выбранные товары не найдены в корзине', HttpStatus.BAD_REQUEST);
    }

    // Вычисляем общую сумму
    let totalAmount = 0;
    const orderItems: any[] = []; // ✅ Явно указываем тип

    for (const cartItem of cartItems) {
      const product = await this.productsService.getOne(cartItem.id_product);
      const price = product.price;
      totalAmount += price * cartItem.quantity;
      orderItems.push({
        id_product: cartItem.id_product,
        quantity: cartItem.quantity,
        price_at_time: price,
      });
    }

    // ✅ Исправлено: id_discount может быть null
    const discountId = dto.id_discount ? dto.id_discount : undefined;

    // Создаем заказ
    const order = await this.orderRepository.create({
      id_seller: dto.id_seller,
      id_buyer: dto.id_buyer,
      date: new Date(),
      id_discount: discountId,
      total_amount: totalAmount,
      shipping_address: dto.shipping_address,
      payment_method: dto.payment_method,
      comment: dto.comment || null,
    } as any);

    // ✅ Исправлено: создаем элементы заказа правильно
    for (const item of orderItems) {
      await this.orderItemRepository.create({
        id_order: order.id_order,
        id_product: item.id_product,
        quantity: item.quantity,
        price_at_time: item.price_at_time,
      } as any);
    }

    // Помечаем товары в корзине как купленные
    await this.cartService.purchaseCart(dto.id_buyer, dto.cartItemIds);

    // Добавляем начальный статус
    const initialStatus = await this.orderStatusRepository.findOne({
      where: { sort_order: 0 }
    });

    if (initialStatus) {
      await this.orderDeliveryRepository.create({
        id_order: order.id_order,
        id_status: initialStatus.id_status,
        date: new Date(),
        comment: 'Заказ создан',
      } as any);
    }

    return this.getOrderById(order.id_order);
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