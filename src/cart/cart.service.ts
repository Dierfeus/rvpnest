import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CartItem } from './cart-item.model';
import { Product } from '../products/products.model';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { DiscountsService } from '../discounts/discounts.service';
import { ProductsService } from "../products/products.service";

@Injectable()
export class CartService {
    constructor(
        private productsService: ProductsService,
        @InjectModel(CartItem) private cartItemRepository: typeof CartItem,
        @InjectModel(Product) private productRepository: typeof Product,
        private discountsService: DiscountsService,
    ) {}

    async getCart(userId: number) {
        const cartItems = await this.cartItemRepository.findAll({
            where: {
                id_user: Number(userId),
                is_purchased: false
            },
            include: ['product'],
            order: [['id_cart', 'ASC']]
        });

        const result: any[] = [];
        for (const item of cartItems) {
            const itemData = item.toJSON();

            let stock = 0;
            if (item.id_product) {
                try {
                    stock = await this.productsService.getProductStock(item.id_product);
                } catch (error) {
                    console.log(`Error getting stock for product ${item.id_product}:`, error);
                    stock = 0;
                }
            }

            result.push({
                ...itemData,
                product: {
                    ...itemData.product,
                    stock: stock || 0,
                },
            });
        }

        return result;
    }

    async getCartCount(userId: number) {
        const items = await this.cartItemRepository.findAll({
            where: { id_user: userId, is_purchased: false }
        });
        const count = items.reduce((sum, item) => sum + item.quantity, 0);
        return { count };
    }

    async getCartItemsByProductIds(userId: number, productIds: number[]) {
        if (!productIds || productIds.length === 0) {
            return [];
        }

        return this.cartItemRepository.findAll({
            where: {
                id_user: userId,
                id_product: productIds,  // ← ищем по ID товаров
                is_purchased: false
            },
            include: ['product']
        });
    }

// старый поиск
    async getCartItemsByCartIds(userId: number, cartItemIds: number[]) {
        if (!cartItemIds || cartItemIds.length === 0) {
            return [];
        }

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
        const stock = await this.productsService.getProductStock(product.dataValues.id_product);
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
        const stock = await this.productsService.getProductStock(product.id_product);
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
        items: any[];
    }> {
        const cartItems = await this.cartItemRepository.findAll({
            where: { id_user: userId, is_purchased: false },
            include: ['product']
        });

        if (cartItems.length === 0) {
            return {
                subtotal: 0,
                discount: 0,
                total: 0,
                discountInfo: null,
                items: []
            };
        }

        let subtotal = 0;
        const itemsWithPrices: any[] = [];

        for (const item of cartItems) {
            const price = item.price_snapshot || item.product?.price || 0;
            const itemTotal = price * item.quantity;
            subtotal += itemTotal;

            const itemJson = item.toJSON();
            itemsWithPrices.push({
                ...itemJson,
                itemTotal: itemTotal,
                price: price
            });
        }

        let discountTotal = 0;
        let discountInfo: any = null;

        const firstItemWithDiscount = cartItems.find(item => item.id_discount);
        if (firstItemWithDiscount && firstItemWithDiscount.id_discount) {
            try {
                const discount = await this.discountsService.getDiscountById(firstItemWithDiscount.id_discount);
                if (discount && discount.is_active) {
                    const now = new Date();
                    const start = new Date(discount.start_time);
                    const end = new Date(discount.end_time);

                    if (now >= start && now <= end) {
                        let discountAmount = 0;
                        if (discount.type === 'percentage') {
                            discountAmount = subtotal * (discount.size / 100);
                            if (discount.max_discount_amount) {
                                discountAmount = Math.min(discountAmount, discount.max_discount_amount);
                            }
                        } else if (discount.type === 'fixed') {
                            discountAmount = Math.min(discount.size, subtotal);
                        }

                        if (discount.min_order_amount && subtotal < discount.min_order_amount) {
                            discountAmount = 0;
                        } else {
                            discountTotal = discountAmount;
                            discountInfo = {
                                id: discount.id_discount,
                                name: discount.name,
                                code: discount.code,
                                type: discount.type,
                                size: discount.size,
                                discountAmount: discountAmount,
                                minOrderAmount: discount.min_order_amount,
                                maxDiscountAmount: discount.max_discount_amount
                            };
                        }
                    } else {
                        for (const item of cartItems) {
                            item.id_discount = null as any;
                            item.discount_amount = 0;
                            await item.save();
                        }
                    }
                }
            } catch (error) {
                console.log('Error getting discount:', error);
            }
        }

        const total = subtotal - discountTotal;

        return {
            subtotal,
            discount: discountTotal,
            total: total < 0 ? 0 : total,
            discountInfo,
            items: itemsWithPrices
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

        const discountData = discount.dataValues || discount;

        if (!discountData.is_active) {
            throw new HttpException('Промокод неактивен', HttpStatus.BAD_REQUEST);
        }

        const now = new Date();
        const start = new Date(discountData.start_time);
        const end = new Date(discountData.end_time);

        if (now < start || now > end) {
            throw new HttpException('Срок действия промокода истек', HttpStatus.BAD_REQUEST);
        }

        let cartItems = await this.cartItemRepository.findAll({
            where: { id_user: userId, is_purchased: false },
            include: ['product']
        });

        if (cartItems.length === 0) {
            throw new HttpException('Корзина пуста', HttpStatus.BAD_REQUEST);
        }

        let subtotal = 0;
        for (const item of cartItems) {
            const price = item.price_snapshot || item.product?.price || 0;
            subtotal += Number(price) * item.quantity;
        }

        if (subtotal <= 0) {
            throw new HttpException('Сумма корзины должна быть больше 0', HttpStatus.BAD_REQUEST);
        }

        if (discountData.min_order_amount && subtotal < Number(discountData.min_order_amount)) {
            throw new HttpException(
                `Минимальная сумма заказа для промокода: ${discountData.min_order_amount}`,
                HttpStatus.BAD_REQUEST
            );
        }

        if (discountData.usage_limit && discountData.used_count >= discountData.usage_limit) {
            throw new HttpException('Лимит использований промокода исчерпан', HttpStatus.BAD_REQUEST);
        }

        let discountAmount = 0;
        if (discountData.type === 'percentage') {
            discountAmount = subtotal * (discountData.size / 100);
            if (discountData.max_discount_amount) {
                discountAmount = Math.min(discountAmount, Number(discountData.max_discount_amount));
            }
        } else if (discountData.type === 'fixed') {
            discountAmount = Math.min(discountData.size, subtotal);
        }

        for (const item of cartItems) {
            console.log(item.toJSON());
            console.log(item.dataValues);
            const price = item.price_snapshot || item.product?.price || 0;
            const itemTotal = Number(price) * item.quantity;
            const itemDiscount = (itemTotal / subtotal) * discountAmount;

            console.log('BEFORE', {
                cart: item.id_cart,
                currentDiscount: item.id_discount,
                discountId: discountData.id_discount,
                itemDiscount,
            });

            item.id_discount = discountData.id_discount;
            item.discount_amount = Math.round(itemDiscount * 100) / 100;
            await item.save(); // СОХРАНЯЕМ ИЗМЕНЕНИЯ
        }

        await this.discountsService.incrementUsageCount(discountData.id_discount, null);

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