import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Order } from './order.model';
import { OrderItem } from './order-item.model';
import { CartItem } from './cart-item.model';
import { OrderDelivery } from './order-delivery.model';
import { OrderStatus } from './order-status.model';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { UsersModule } from '../users/users.module'; // для связей с User
import { ProductsModule } from '../products/products.module';
import { DiscountsModule } from '../discounts/discounts.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Order, OrderItem, CartItem, OrderDelivery, OrderStatus]),
    UsersModule,
    ProductsModule,
    DiscountsModule,
  ],
  providers: [OrdersService],
  controllers: [OrdersController],
  exports: [OrdersService],
})
export class OrdersModule {}