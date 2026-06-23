import {
    Controller, Get, Post, Put, Delete, Body, Param,
    UseGuards, HttpCode, HttpStatus, Req
} from '@nestjs/common';
import {
    ApiTags, ApiOperation, ApiResponse, ApiBearerAuth,
    ApiParam, ApiBody, ApiOkResponse, ApiCreatedResponse,
    ApiNotFoundResponse, ApiBadRequestResponse, ApiUnauthorizedResponse
} from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartItem } from './cart-item.model';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Корзина')
@ApiBearerAuth('JWT-auth')
@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
    constructor(private cartService: CartService) {}

    // ==================== GET ====================
    @Get()
    @ApiOperation({
        summary: 'Получить корзину текущего пользователя',
        description: 'Возвращает все товары в корзине пользователя.'
    })
    @ApiOkResponse({
        type: [CartItem],
        description: 'Товары в корзине'
    })
    @ApiUnauthorizedResponse({ description: 'Пользователь не авторизован' })
    async getCart(@Req() req: any) {
        return this.cartService.getCart(req.user.id);
    }

    @Get('count')
    @ApiOperation({
        summary: 'Получить количество товаров в корзине',
        description: 'Возвращает общее количество товаров в корзине пользователя.'
    })
    @ApiOkResponse({
        schema: {
            type: 'object',
            properties: {
                count: { type: 'number', example: 5 }
            }
        }
    })
    async getCartCount(@Req() req: any) {
        return this.cartService.getCartCount(req.user.id);
    }

    @Get('total')
    @ApiOperation({
        summary: 'Получить общую сумму корзины',
        description: 'Возвращает общую стоимость всех товаров в корзине.'
    })
    @ApiOkResponse({
        schema: {
            type: 'object',
            properties: {
                total: { type: 'number', example: 15000.50 }
            }
        }
    })
    async getCartTotal(@Req() req: any) {
        return this.cartService.getCartTotal(req.user.id);
    }

    // ==================== POST ====================
    @Post()
    @ApiOperation({
        summary: 'Добавить товар в корзину',
        description: 'Добавляет товар в корзину пользователя. Если товар уже есть, увеличивает количество.'
    })
    @ApiCreatedResponse({
        type: CartItem,
        description: 'Товар успешно добавлен в корзину'
    })
    @ApiBadRequestResponse({ description: 'Некорректные данные' })
    @ApiBody({ type: AddToCartDto })
    async addToCart(@Req() req: any, @Body() dto: AddToCartDto) {
        return this.cartService.addToCart(req.user.id, dto);
    }

    // ==================== PUT ====================
    @Put(':productId')
    @ApiOperation({
        summary: 'Обновить количество товара в корзине',
        description: 'Изменяет количество конкретного товара в корзине пользователя.'
    })
    @ApiParam({
        name: 'productId',
        type: 'number',
        description: 'ID товара',
        example: 1
    })
    @ApiBody({ type: UpdateCartItemDto })
    @ApiOkResponse({
        type: CartItem,
        description: 'Количество товара обновлено'
    })
    @ApiNotFoundResponse({ description: 'Товар не найден в корзине' })
    async updateQuantity(
        @Req() req: any,
        @Param('productId') productId: number,
        @Body() dto: UpdateCartItemDto
    ) {
        return this.cartService.updateQuantity(req.user.id, productId, dto.quantity);
    }

    // ==================== DELETE ====================
    @Delete(':productId')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Удалить товар из корзины',
        description: 'Удаляет конкретный товар из корзины пользователя.'
    })
    @ApiParam({
        name: 'productId',
        type: 'number',
        description: 'ID товара',
        example: 1
    })
    @ApiOkResponse({
        description: 'Товар успешно удален из корзины'
    })
    @ApiNotFoundResponse({ description: 'Товар не найден в корзине' })
    async removeFromCart(@Req() req: any, @Param('productId') productId: number) {
        return this.cartService.removeFromCart(req.user.id, productId);
    }

    @Delete()
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Очистить корзину',
        description: 'Удаляет все товары из корзины пользователя.'
    })
    @ApiOkResponse({
        description: 'Корзина успешно очищена'
    })
    async clearCart(@Req() req: any) {
        return this.cartService.clearCart(req.user.id);
    }
}