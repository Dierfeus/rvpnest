import {
  Controller, Get, Post, Put, Delete, Body, Param,
  UseGuards, HttpCode, HttpStatus, Query, Req
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth,
  ApiParam, ApiQuery, ApiBody, ApiOkResponse, ApiCreatedResponse,
  ApiNotFoundResponse, ApiBadRequestResponse, ApiUnauthorizedResponse
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { Order } from './order.model';
import { Roles } from '../auth/roles-auth.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Заказы')
@ApiBearerAuth('JWT-auth')
@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  @ApiOperation({
    summary: 'Создать заказ',
    description: 'Создает новый заказ из товаров в корзине. Товары помечаются как купленные.'
  })
  @ApiCreatedResponse({
    type: Order,
    description: 'Заказ успешно создан'
  })
  @ApiBadRequestResponse({ description: 'Некорректные данные или пустая корзина' })
  @ApiBody({ type: CreateOrderDto })
  async createOrder(@Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(dto);
  }

  @Get()
  @Roles('admin')
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Получить все заказы (Админ)',
    description: 'Возвращает список всех заказов. Доступно только администраторам.'
  })
  @ApiOkResponse({
    type: [Order],
    description: 'Список всех заказов'
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: Number,
    description: 'Фильтр по статусу заказа'
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Количество записей на странице'
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Смещение для пагинации'
  })
  async getAllOrders(
      @Query('status') statusId?: number,
      @Query('limit') limit: number = 10,
      @Query('offset') offset: number = 0
  ) {
    return this.ordersService.getAllOrders(statusId, limit, offset);
  }

  @Get('my')
  @ApiOperation({
    summary: 'Получить мои заказы',
    description: 'Возвращает список заказов текущего пользователя.'
  })
  @ApiOkResponse({
    type: [Order],
    description: 'Список заказов пользователя'
  })
  async getMyOrders(@Req() req: any) {
    return this.ordersService.getOrdersByUser(req.user.id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Получить заказ по ID',
    description: 'Возвращает информацию о конкретном заказе.'
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID заказа',
    example: 1
  })
  @ApiOkResponse({
    type: Order,
    description: 'Информация о заказе'
  })
  @ApiNotFoundResponse({ description: 'Заказ не найден' })
  async getOrderById(@Param('id') id: number) {
    return this.ordersService.getOrderById(id);
  }

  @Get('statuses')
  @ApiOperation({
    summary: 'Получить все статусы заказов',
    description: 'Возвращает список всех возможных статусов заказов.'
  })
  @ApiOkResponse({
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id_status: { type: 'number', example: 1 },
          name: { type: 'string', example: 'Оформлен' },
          description: { type: 'string', example: 'Заказ создан' }
        }
      }
    }
  })
  async getAllStatuses() {
    return this.ordersService.getAllStatuses();
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Обновить заказ',
    description: 'Обновляет информацию о заказе (адрес, способ оплаты, комментарий).'
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID заказа',
    example: 1
  })
  @ApiBody({ type: UpdateOrderDto })
  @ApiOkResponse({
    type: Order,
    description: 'Заказ успешно обновлен'
  })
  @ApiNotFoundResponse({ description: 'Заказ не найден' })
  async updateOrder(
      @Param('id') id: number,
      @Body() dto: UpdateOrderDto
  ) {
    return this.ordersService.updateOrder(id, dto);
  }

  @Put(':id/status')
  @ApiOperation({
    summary: 'Обновить статус заказа',
    description: 'Изменяет статус заказа и добавляет запись в историю статусов.'
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID заказа',
    example: 1
  })
  @ApiBody({ type: UpdateOrderStatusDto })
  @ApiOkResponse({
    description: 'Статус заказа обновлен'
  })
  @ApiNotFoundResponse({ description: 'Заказ или статус не найден' })
  async updateOrderStatus(
      @Param('id') id: number,
      @Body() dto: UpdateOrderStatusDto
  ) {
    return this.ordersService.updateOrderStatus(id, dto.id_status, dto.comment);
  }

  @Delete(':id')
  @Roles('admin')
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Удалить заказ (Админ)',
    description: 'Полное удаление заказа из системы. Доступно только администраторам.'
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID заказа',
    example: 1
  })
  @ApiOkResponse({
    description: 'Заказ успешно удален'
  })
  @ApiNotFoundResponse({ description: 'Заказ не найден' })
  async deleteOrder(@Param('id') id: number) {
    return this.ordersService.deleteOrder(id);
  }
}