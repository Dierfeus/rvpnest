import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Product } from './products.model';
import { ProductCharacteristic } from './product-characteristic.model';
import { Entrance } from './entrance.model';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { CategoriesModule } from '../categories/categories.module';
import { CharacteristicsModule } from '../characteristics/characteristics.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Product, ProductCharacteristic, Entrance]),
    CategoriesModule,
    CharacteristicsModule,
  ],
  providers: [ProductsService],
  controllers: [ProductsController],
  exports: [ProductsService],
})
export class ProductsModule {}