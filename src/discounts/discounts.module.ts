import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DiscountType } from './discount-type.model';
import { Discount } from './discount.model';
import { ProductDiscount } from './product-discount.model';
import { DiscountsService } from './discounts.service';
import { DiscountsController } from './discounts.controller';
import { AuthModule } from '../auth/auth.module';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [
    SequelizeModule.forFeature([DiscountType, Discount, ProductDiscount]),
    AuthModule,
    ProductsModule,
  ],
  providers: [DiscountsService],
  controllers: [DiscountsController],
  exports: [DiscountsService],
})
export class DiscountsModule {}