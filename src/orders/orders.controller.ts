import { Controller, Get, Post, Body, Param, Delete, Patch, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Заказы и корзина')
@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  // Корзина
  @ApiOperation({ summary: 'Добавить в корзину' })
  @Post('cart')
  addToCart(@Body() dto: AddToCartDto) {
    return this.ordersService.addToCart(dto);
  }

  @ApiOperation({ summary: 'Корзина пользователя' })
  @Get('cart/:userId')
  getUserCart(@Param('userId') userId: number) {
    return this.ordersService.getUserCart(userId);
  }

  @ApiOperation({ summary: 'Удалить из корзины' })
  @Delete('cart/:userId/:productId')
  removeFromCart(@Param('userId') userId: number, @Param('productId') productId: number) {
    return this.ordersService.removeFromCart(userId, productId);
  }

  // Заказы
  @ApiOperation({ summary: 'Создать заказ' })
  @Post()
  createOrder(@Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(dto);
  }

  @ApiOperation({ summary: 'Все заказы' })
  @Get()
  getAllOrders() {
    return this.ordersService.getAllOrders();
  }

  @ApiOperation({ summary: 'Заказы пользователя' })
  @Get('user/:userId')
  @ApiQuery({ name: 'as', enum: ['buyer', 'seller'] })
  getOrdersByUser(@Param('userId') userId: number, @Query('as') as: 'buyer' | 'seller') {
    return this.ordersService.getOrdersByUser(userId, as);
  }

  @ApiOperation({ summary: 'Обновить статус заказа' })
  @Patch(':orderId/status/:statusId')
  updateStatus(@Param('orderId') orderId: number, @Param('statusId') statusId: number) {
    return this.ordersService.updateOrderStatus(orderId, statusId);
  }
}