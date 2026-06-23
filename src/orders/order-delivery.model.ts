import { Column, DataType, Model, Table, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Order } from './order.model';
import { OrderStatus } from './order-status.model';

@Table({ tableName: 'order_deliveries', timestamps: false })
export class OrderDelivery extends Model<OrderDelivery> {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  id_delivery: number;

  @ForeignKey(() => Order)
  @Column({ type: DataType.INTEGER })
  id_order: number;

  @ForeignKey(() => OrderStatus)
  @Column({ type: DataType.INTEGER })
  id_status: number;

  @Column({ type: DataType.DATE })
  date: Date;

  @Column({ type: DataType.TEXT, allowNull: true })
  comment: string;

  @BelongsTo(() => Order)
  order: Order;

  @BelongsTo(() => OrderStatus)
  status: OrderStatus;
}