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

    async addToCart(userId: number, dto: AddToCartDto) {
        const product = await this.productRepository.findByPk(dto.id_product);
        if (!product) {
            throw new HttpException('Товар не найден', HttpStatus.NOT_FOUND);
        }

        const stock = product.getDataValue('stock') || 0;
        const quantity = dto.quantity || 1;

        if (stock < quantity) {
            throw new HttpException(
                `Недостаточно товара на складе. Доступно: ${stock}`,
                HttpStatus.BAD_REQUEST
            );
        }

        let cartItem = await this.cartItemRepository.findOne({
            where: {
                id_user: userId,
                id_product: dto.id_product,
                is_purchased: false
            }
        });

        const priceSnapshot = product.getDataValue('price');

        if (cartItem) {
            const newQuantity = cartItem.quantity + quantity;
            if (stock < newQuantity) {
                throw new HttpException(
                    `Недостаточно товара на складе. Доступно: ${stock}`,
                    HttpStatus.BAD_REQUEST
                );
            }
            cartItem.quantity = newQuantity;
            cartItem.price_snapshot = priceSnapshot;
            await cartItem.save();
        } else {
            cartItem = await this.cartItemRepository.create({
                id_user: userId,
                id_product: dto.id_product,
                quantity: quantity,
                price_snapshot: priceSnapshot,
                is_purchased: false
            } as any);
        }

        return cartItem;
    }

    async updateQuantity(userId: number, productId: number, quantity: number) {
        if (quantity <= 0) {
            throw new HttpException('Количество должно быть больше 0', HttpStatus.BAD_REQUEST);
        }

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
        const product = await this.productRepository.findByPk(productId);
        if (product==null) return "Товар не найден"
        const stock = product.getDataValue('stock') || 0;

        if (stock < quantity) {
            throw new HttpException(
                `Недостаточно товара на складе. Доступно: ${stock}`,
                HttpStatus.BAD_REQUEST
            );
        }

        cartItem.quantity = quantity;
        await cartItem.save();
        return cartItem;
    }

    async removeFromCart(userId: number, cartId: number) {
        const cartItem = await this.cartItemRepository.findOne({
            where: {
                id_user: userId,
                id_cart: cartId,
                is_purchased: false
            }
        });

        if (!cartItem) {
            throw new HttpException('Товар не найден в корзине', HttpStatus.NOT_FOUND);
        }

        await cartItem.destroy();
        return { message: 'Товар удален из корзины' };
    }

    async getCartTotal(userId: number): Promise<{ subtotal: number; discount: number; total: number }> {
        const items = await this.cartItemRepository.findAll({
            where: { id_user: userId, is_purchased: false },
            include: ['product']
        });

        let subtotal = 0;
        let discountTotal = 0;

        for (const item of items) {
            const price = item.price_snapshot || item.product?.price || 0;
            const itemTotal = price * item.quantity;
            subtotal += itemTotal;
            discountTotal += item.discount_amount || 0;
        }

        return {
            subtotal,
            discount: discountTotal,
            total: subtotal - discountTotal
        };
    }

    async purchaseCartWithTransaction(userId: number, cartItemIds: number[], transaction: any) {
        const where: any = {
            id_user: userId,
            is_purchased: false,
            id_cart: cartItemIds
        };

        const cartItems = await this.cartItemRepository.findAll({
            where,
            transaction
        });

        if (cartItems.length === 0) {
            throw new HttpException('Корзина пуста', HttpStatus.BAD_REQUEST);
        }

        for (const item of cartItems) {
            item.is_purchased = true;
            item.purchased_at = new Date();
            await item.save({ transaction });
        }

        return cartItems;
    }

}