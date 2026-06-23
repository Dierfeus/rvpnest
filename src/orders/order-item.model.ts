import { Column, DataType, Model, Table, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Order } from './order.model';
import { Product } from '../products/products.model';

@Table({ tableName: 'order_items', timestamps: false })
export class OrderItem extends Model<OrderItem> {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  id_order_item: number;

  @ForeignKey(() => Order)
  @Column({ type: DataType.INTEGER })
  id_order: number;

  @ForeignKey(() => Product)
  @Column({ type: DataType.INTEGER })
  id_product: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  quantity: number;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  price_at_time: number;

  @BelongsTo(() => Order)
  order: Order;

  @BelongsTo(() => Product)
  product: Product;
}