import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CartItem } from './cart-item.model';
import { Product } from '../products/products.model';
import { AddToCartDto } from './dto/add-to-cart.dto';

@Injectable()
export class CartService {
    constructor(
        @InjectModel(CartItem) private cartItemRepository: typeof CartItem,
        @InjectModel(Product) private productRepository: typeof Product,
    ) {}

    async getCart(userId: number) {
        return this.cartItemRepository.findAll({
            where: { id_user: userId, is_purchased: false },
            include: ['product'],
            order: [['id_cart', 'ASC']]
        });
    }

    async getCartCount(userId: number) {
        const items = await this.cartItemRepository.findAll({
            where: { id_user: userId, is_purchased: false }
        });
        const count = items.reduce((sum, item) => sum + item.quantity, 0);
        return { count };
    }

    async getCartTotal(userId: number) {
        const items = await this.cartItemRepository.findAll({
            where: { id_user: userId, is_purchased: false },
            include: ['product']
        });
        const total = items.reduce((sum, item) => {
            return sum + (item.product?.price || 0) * item.quantity;
        }, 0);
        return { total };
    }

    async addToCart(userId: number, dto: AddToCartDto) {
        const product = await this.productRepository.findByPk(dto.id_product);
        if (!product) {
            throw new HttpException('Товар не найден', HttpStatus.NOT_FOUND);
        }

        let cartItem = await this.cartItemRepository.findOne({
            where: {
                id_user: userId,
                id_product: dto.id_product,
                is_purchased: false
            }
        });

        if (cartItem) {
            cartItem.quantity += dto.quantity || 1;
            await cartItem.save();
        } else {
            // ✅ Исправлено: создаем через create с правильной типизацией
            cartItem = await this.cartItemRepository.create({
                id_user: userId,
                id_product: dto.id_product,
                quantity: dto.quantity || 1,
                is_purchased: false
            } as any);
        }

        return cartItem;
    }

    async updateQuantity(userId: number, productId: number, quantity: number) {
        const cartItem = await this.cartItemRepository.findOne({
            where: {
                id_user: userId,
                id_product: productId,
                is_purchased: false
            }
        });

        if (!cartItem) {
            throw new HttpException('Товар не найден в корзине', HttpStatus.NOT_FOUND);
        }

        cartItem.quantity = quantity;
        await cartItem.save();
        return cartItem;
    }

    async removeFromCart(userId: number, productId: number) {
        const cartItem = await this.cartItemRepository.findOne({
            where: {
                id_user: userId,
                id_product: productId,
                is_purchased: false
            }
        });

        if (!cartItem) {
            throw new HttpException('Товар не найден в корзине', HttpStatus.NOT_FOUND);
        }

        await cartItem.destroy();
        return { message: 'Товар удален из корзины' };
    }

    async clearCart(userId: number) {
        await this.cartItemRepository.destroy({
            where: { id_user: userId, is_purchased: false }
        });
        return { message: 'Корзина очищена' };
    }

    async getCartItemsByIds(userId: number, cartItemIds: number[]) {
        return this.cartItemRepository.findAll({
            where: {
                id_user: userId,
                id_cart: cartItemIds,
                is_purchased: false
            },
            include: ['product']
        });
    }

    async purchaseCart(userId: number, cartItemIds?: number[]): Promise<CartItem[]> {
        const where: any = { id_user: userId, is_purchased: false };
        if (cartItemIds && cartItemIds.length > 0) {
            where.id_cart = cartItemIds;
        }

        const cartItems = await this.cartItemRepository.findAll({ where });

        if (cartItems.length === 0) {
            throw new HttpException('Корзина пуста', HttpStatus.BAD_REQUEST);
        }

        for (const item of cartItems) {
            item.is_purchased = true;
            item.purchased_at = new Date();
            await item.save();
        }

        return cartItems;
    }
}