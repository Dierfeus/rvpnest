import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CartItem } from './cart-item.model';
import { Product } from '../products/products.model';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { ProductsModule } from '../products/products.module';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        SequelizeModule.forFeature([CartItem, Product]),
        ProductsModule,
        AuthModule,
    ],
    providers: [CartService],
    controllers: [CartController],
    exports: [CartService],
})
export class CartModule {}