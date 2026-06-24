import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CartItem } from './cart-item.model';
import { Product } from '../products/products.model';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { DiscountsService } from '../discounts/discounts.service';

@Injectable()
export class CartService {
    constructor(
        @InjectModel(CartItem) private cartItemRepository: typeof CartItem,
        @InjectModel(Product) private productRepository: typeof Product,
        private discountsService: DiscountsService,
    ) {}

    async getCart(userId: number) {
        return this.cartItemRepository.findAll({
            where: {
                id_user: Number(userId),
                is_purchased: false
            },
            include: ['product'],
            order: [['id_cart', 'ASC']]
        });
    }

    async cleanInvalidCartItems(userId: number) {
        let cleaned = 0;
        const allItems = await this.cartItemRepository.findAll({
            where: { id_user: userId, is_purchased: false }
        });
        for (const item of allItems) {
            if (!item.id_product || item.id_product <= 0) {
                await item.destroy();
                cleaned++;
            } else {
                const product = await this.productRepository.findByPk(item.id_product);
                if (!product) {
                    await item.destroy();
                    cleaned++;
                }
            }
        }
        return { cleaned };
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
        if (!product) {
            throw new HttpException('Товар не найден', HttpStatus.NOT_FOUND);
        }
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

    async getCartTotal(userId: number): Promise<{
        subtotal: number;
        discount: number;
        total: number;
        discountInfo: any;
    }> {
        const items = await this.cartItemRepository.findAll({
            where: { id_user: userId, is_purchased: false },
            include: ['product']
        });
        let subtotal = 0;
        let discountTotal = 0;
        let discountInfo: any = null;
        for (const item of items) {
            const price = item.price_snapshot || item.product?.price || 0;
            const itemTotal = price * item.quantity;
            subtotal += itemTotal;
            discountTotal += item.discount_amount || 0;
        }
        if (items.length > 0 && items[0].id_discount) {
            try {
                const discount = await this.discountsService.getDiscountById(items[0].id_discount);
                if (discount) {
                    discountInfo = {
                        id: discount.id_discount,
                        name: discount.name,
                        code: discount.code,
                        type: discount.type,
                        size: discount.size,
                        discountAmount: discountTotal
                    };
                }
            } catch (error) {}
        }
        return {
            subtotal,
            discount: discountTotal,
            total: subtotal - discountTotal,
            discountInfo
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

    async applyDiscountToCart(userId: number, discountCode: string) {
        const discount = await this.discountsService.getDiscountByCode(discountCode.trim());
        if (!discount) {
            throw new HttpException('Промокод не найден', HttpStatus.NOT_FOUND);
        }
        const cartItems = await this.getCart(userId);
        if (cartItems.length === 0) {
            throw new HttpException('Корзина пуста', HttpStatus.BAD_REQUEST);
        }
        let subtotal = 0;
        for (const item of cartItems) {
            const price = item.price_snapshot || item.product?.price || 0;
            subtotal += price * item.quantity;
        }
        const validatedDiscount = await this.discountsService.validateAndGetDiscount(
            discount.id_discount,
            subtotal,
            userId
        );
        if (!validatedDiscount) {
            throw new HttpException('Скидка не может быть применена', HttpStatus.BAD_REQUEST);
        }
        let discountAmount = 0;
        if (discount.type === 'percentage') {
            discountAmount = subtotal * (discount.size / 100);
            if (discount.max_discount_amount) {
                discountAmount = Math.min(discountAmount, discount.max_discount_amount);
            }
        } else if (discount.type === 'fixed') {
            discountAmount = Math.min(discount.size, subtotal);
        }
        for (const item of cartItems) {
            const price = item.price_snapshot || item.product?.price || 0;
            const itemTotal = price * item.quantity;
            if (subtotal <= 0) {
                throw new HttpException('Сумма корзины должна быть больше 0', HttpStatus.BAD_REQUEST);
            }
            const itemDiscount = (itemTotal / subtotal) * discountAmount;
            item.id_discount = discount.id_discount;
            item.discount_amount = Math.round(itemDiscount * 100) / 100;
            await item.save();
        }
        return this.getCart(userId);
    }

    async removeDiscountFromCart(userId: number) {
        const cartItems = await this.cartItemRepository.findAll({
            where: { id_user: userId, is_purchased: false }
        });
        for (const item of cartItems) {
            item.id_discount = null as any;
            item.discount_amount = 0;
            await item.save();
        }
        return { message: 'Скидка удалена из корзины' };
    }

    async clearCart(userId: number) {
        await this.cartItemRepository.destroy({
            where: { id_user: userId, is_purchased: false }
        });
        return { message: 'Корзина очищена' };
    }
}