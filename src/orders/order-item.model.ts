import { Column, DataType, Model, Table, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Order } from './order.model';
import { Product } from '../products/products.model';

@Table({ tableName: 'orderItems', timestamps: false })
export class OrderItem extends Model<OrderItem> {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  id_order_item: number;

  @ForeignKey(() => Order)
  @Column({ type: DataType.INTEGER })
  id_order: number;

  @ForeignKey(() => Product)
  @Column({ type: DataType.INTEGER })
  id_product: number;

  @BelongsTo(() => Order)
  order: Order;

  @BelongsTo(() => Product)
  product: Product;
}