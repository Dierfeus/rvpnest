import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Order } from './order.model';
import { OrderItem } from './order-item.model';
import { CartItem } from './cart-item.model';
import { OrderDelivery } from './order-delivery.model';
import { OrderStatus } from './order-status.model';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order) private orderRepository: typeof Order,
    @InjectModel(OrderItem) private orderItemRepository: typeof OrderItem,
    @InjectModel(CartItem) private cartItemRepository: typeof CartItem,
    @InjectModel(OrderDelivery) private orderDeliveryRepository: typeof OrderDelivery,
    @InjectModel(OrderStatus) private orderStatusRepository: typeof OrderStatus,
  ) {}

  // Корзина
  async addToCart(dto: AddToCartDto) {
    const existing = await this.cartItemRepository.findOne({
      where: { id_user: dto.id_user, id_product: dto.id_product },
    });
    if (existing) {
      throw new HttpException('Товар уже в корзине', HttpStatus.BAD_REQUEST);
    }
    // Исправлено: передаём plain object
    return this.cartItemRepository.create({
      id_user: dto.id_user,
      id_product: dto.id_product,
      item_deleted: false,
    } as any);
  }

  async getUserCart(id_user: number) {
    return this.cartItemRepository.findAll({
      where: { id_user, item_deleted: false },
      include: ['product'],
    });
  }

  async removeFromCart(id_user: number, id_product: number) {
    const item = await this.cartItemRepository.findOne({
      where: { id_user, id_product },
    });
    if (!item) throw new HttpException('Товар не найден в корзине', HttpStatus.NOT_FOUND);
    await item.destroy();
    return { message: 'Товар удалён из корзины' };
  }

  // Заказы
  async createOrder(dto: CreateOrderDto) {
    // Исправлено: преобразуем строку даты в Date объект
    const order = await this.orderRepository.create({
      id_seller: dto.id_seller,
      id_buyer: dto.id_buyer,
      date: new Date(dto.date),
      id_discount: dto.id_discount,
    } as any);
    
    // Добавляем товары в orderItems
    for (const productId of dto.productIds) {
      await this.orderItemRepository.create({
        id_order: order.id_order,
        id_product: productId,
      } as any);
    }
    
    // Удаляем эти товары из корзины покупателя
    for (const productId of dto.productIds) {
      await this.cartItemRepository.destroy({
        where: { id_user: dto.id_buyer, id_product: productId },
      });
    }
    
    // Статус доставки (например, первый статус "Оформлен")
    const firstStatus = await this.orderStatusRepository.findOne();
    if (firstStatus) {
      await this.orderDeliveryRepository.create({
        id_order: order.id_order,
        id_status: firstStatus.id_status,
        date: new Date(),
      } as any);
    }
    return order;
  }

  async getAllOrders() {
    return this.orderRepository.findAll({
      include: ['seller', 'buyer', 'discount', 'items', 'deliveries'],
    });
  }

  async getOrdersByUser(userId: number, role: 'buyer' | 'seller') {
    return this.orderRepository.findAll({
      where: { [role === 'buyer' ? 'id_buyer' : 'id_seller']: userId },
      include: ['items', 'deliveries'],
    });
  }

  async updateOrderStatus(id_order: number, id_status: number) {
    const order = await this.orderRepository.findByPk(id_order);
    if (!order) throw new HttpException('Заказ не найден', HttpStatus.NOT_FOUND);
    
    await this.orderDeliveryRepository.create({
      id_order,
      id_status,
      date: new Date(),
    } as any);
    
    return { message: 'Статус обновлён' };
  }
}