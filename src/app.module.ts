import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { UsersModule } from './users/users.module';
import { ConfigModule } from "@nestjs/config";
import * as process from "node:process";
import { User } from "./users/users.model";
import { RolesModule } from './roles/roles.module';
import { UserRoles } from "./roles/user-roles.model";
import { Role } from "./roles/roles.model";
import { AuthModule } from './auth/auth.module';
import { FilesModule } from './files/files.module';
import { ServeStaticModule } from "@nestjs/serve-static";
import { CategoriesModule } from './categories/categories.module';
import { CharacteristicsModule } from './characteristics/characteristics.module';
import { ProductsModule } from './products/products.module';
import { DiscountsModule } from './discounts/discounts.module';
import { OrdersModule } from './orders/orders.module';
import * as path from "path";

// Импортируем все модели
import { Category } from './categories/categories.model';
import { Characteristic } from './characteristics/characteristics.model';
import { CharacteristicValue } from './characteristics/characteristic-value.model';
import { Product } from './products/products.model';
import { ProductCharacteristic } from './products/product-characteristic.model';
import { Entrance } from './products/entrance.model';
import { Discount } from './discounts/discount.model';
import { DiscountType } from './discounts/discount-type.model';
import { Order } from './orders/order.model';
import { OrderItem } from './orders/order-item.model';
import { CartItem } from './cart/cart-item.model';
import { OrderDelivery } from './orders/order-delivery.model';
import { OrderStatus } from './orders/order-status.model';
import {CartModule} from "./cart/cart.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: `.${process.env.NODE_ENV}.env`,
        }),
        ServeStaticModule.forRoot({
            rootPath: path.resolve(__dirname, 'static')
        }),
        SequelizeModule.forRoot({
            dialect: 'postgres',
            host: process.env.POSTGRES_HOST,
            port: Number(process.env.POSTGRES_PORT),
            username: process.env.POSTGRES_USER,
            password: process.env.POSTGRES_PASSWORD,
            database: process.env.POSTGRES_DB,
            models: [
                User,
                Role,
                UserRoles,
                Category,
                Characteristic,
                CharacteristicValue,
                Product,
                ProductCharacteristic,
                Entrance,
                Discount,
                DiscountType,
                Order,
                OrderItem,
                CartItem,
                OrderDelivery,
                OrderStatus,
            ],
            autoLoadModels: true,
            synchronize: process.env.NODE_ENV !== 'production',
        }),
        AuthModule,
        UsersModule,
        RolesModule,
        CartModule,
        OrdersModule,
        ProductsModule,
        CategoriesModule,
        CharacteristicsModule,
        DiscountsModule,
        FilesModule,
    ]
})
export class AppModule {}