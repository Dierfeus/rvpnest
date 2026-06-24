import { Column, DataType, Model, Table, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Product } from './products.model';
import { Order } from '../orders/order.model';

@Table({ tableName: 'write_offs', timestamps: true })
export class WriteOff extends Model<WriteOff> {
    @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
    id_write_off: number;

    @ForeignKey(() => Product)
    @Column({ type: DataType.INTEGER, allowNull: false })
    id_product: number;

    @ForeignKey(() => Order)
    @Column({ type: DataType.INTEGER, allowNull: false })
    id_order: number;

    @Column({ type: DataType.DATE, allowNull: false })
    date: Date;

    @Column({ type: DataType.INTEGER, allowNull: false })
    quantity: number;

    @Column({ type: DataType.TEXT, allowNull: true })
    reason: string;

    @BelongsTo(() => Product)
    product: Product;

    @BelongsTo(() => Order)
    order: Order;
}