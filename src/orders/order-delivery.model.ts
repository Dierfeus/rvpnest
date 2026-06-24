import { Column, DataType, Model, Table, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Order } from './order.model';
import { OrderStatus } from './order-status.model';

@Table({ tableName: 'order_deliveries', timestamps: false })
export class OrderDelivery extends Model<OrderDelivery> {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  declare  id_delivery: number;

  @ForeignKey(() => Order)
  @Column({ type: DataType.INTEGER })
  declare  id_order: number;

  @ForeignKey(() => OrderStatus)
  @Column({ type: DataType.INTEGER })
  declare  id_status: number;

  @Column({ type: DataType.DATE })
  declare  date: Date;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare  comment: string;

  @BelongsTo(() => Order)
  declare order: Order;

  @BelongsTo(() => OrderStatus)
  declare status: OrderStatus;
}