import { Column, DataType, Model, Table, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Order } from './order.model';
import { OrderStatus } from './order-status.model';

@Table({ tableName: 'ordersDelivery', timestamps: false })
export class OrderDelivery extends Model<OrderDelivery> {
  @ForeignKey(() => Order)
  @Column({ type: DataType.INTEGER, primaryKey: true })
  id_order: number;

  @ForeignKey(() => OrderStatus)
  @Column({ type: DataType.INTEGER, primaryKey: true })
  id_status: number;

  @Column({ type: DataType.DATE })
  date: Date;

  @BelongsTo(() => Order)
  order: Order;

  @BelongsTo(() => OrderStatus)
  status: OrderStatus;
}