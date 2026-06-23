import { Column, DataType, Model, Table, HasMany } from 'sequelize-typescript';
import { OrderDelivery } from './order-delivery.model';

@Table({ tableName: 'order_statuses', timestamps: false })
export class OrderStatus extends Model<OrderStatus> {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  id_status: number;

  @Column({ type: DataType.STRING, allowNull: false })
  name: string;

  @Column({ type: DataType.STRING, allowNull: true })
  description: string;

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  sort_order: number;

  @HasMany(() => OrderDelivery)
  deliveries: OrderDelivery[];
}