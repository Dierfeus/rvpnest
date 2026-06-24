import {
    Controller, Get, Post, Put, Delete, Body, Param,
    UseGuards, HttpCode, HttpStatus, Req, HttpException
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

    @Delete(':cartId')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Удалить товар из корзины по ID',
        description: 'Удаляет конкретный товар из корзины пользователя по id_cart.'
    })
    @ApiParam({
        name: 'cartId',
        type: 'number',
        description: 'ID записи в корзине (id_cart)',
        example: 1
    })
    async removeFromCart(@Req() req: any, @Param('cartId') cartId: number) {
        return this.cartService.removeFromCart(req.user.id, cartId);
    }

    @Post('apply-discount')
    @ApiOperation({
        summary: 'Применить промокод к корзине',
        description: 'Применяет промокод к текущей корзине пользователя.'
    })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                code: { type: 'string', example: 'NEWYEAR2025' }
            }
        }
    })
    @ApiOkResponse({
        description: 'Промокод применен',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Промокод NEWYEAR2025 успешно применен' },
                discount: {
                    type: 'object',
                    properties: {
                        id_discount: { type: 'number', example: 1 },
                        name: { type: 'string', example: 'Новогодняя распродажа' },
                        size: { type: 'number', example: 15.5 },
                        type: { type: 'string', example: 'percentage' }
                    }
                }
            }
        }
    })
    @ApiBadRequestResponse({ description: 'Промокод недействителен' })
    async applyDiscountToCart(
        @Req() req: any,
        @Body('code') code: string
    ) {
        if (!code) {
            throw new HttpException('Код промокода обязателен', HttpStatus.BAD_REQUEST);
        }
        const result = await this.cartService.applyDiscountToCart(req.user.id, code);
        return {
            message: `Промокод ${code} успешно применен`,
            cart: result
        };
    }

    @Delete('discount')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Убрать скидку из корзины',
        description: 'Удаляет примененную скидку из корзины.'
    })
    @ApiOkResponse({
        description: 'Скидка удалена',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Скидка удалена из корзины' }
            }
        }
    })
    async removeDiscountFromCart(@Req() req: any) {
        return this.cartService.removeDiscountFromCart(req.user.id);
    }

    @Delete('clean')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Очистить некорректные записи корзины',
        description: 'Удаляет записи корзины с некорректными ID товаров.'
    })
    @ApiOkResponse({
        description: 'Некорректные записи удалены',
        schema: {
            type: 'object',
            properties: {
                cleaned: { type: 'number', example: 1 }
            }
        }
    })
    async cleanInvalidCart(@Req() req: any) {
        return this.cartService.cleanInvalidCartItems(req.user.id);
    }

}