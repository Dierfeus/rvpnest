import { Column, DataType, ForeignKey, Model, Table, BelongsTo } from 'sequelize-typescript';
import { Product } from '../products/products.model';
import { Discount } from './discount.model';

@Table({ tableName: 'product_discounts', timestamps: true })
export class ProductDiscount extends Model<ProductDiscount> {
    @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
    declare id: number;

    @ForeignKey(() => Product)
    @Column({ type: DataType.INTEGER, allowNull: false })
    declare id_product: number;

    @ForeignKey(() => Discount)
    @Column({ type: DataType.INTEGER, allowNull: false })
    declare id_discount: number;

    @Column({ type: DataType.BOOLEAN, defaultValue: true })
    declare is_active: boolean;

    @BelongsTo(() => Product)
    declare product: Product;

    @BelongsTo(() => Discount)
    declare discount: Discount;
}