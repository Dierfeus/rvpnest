import { Column, DataType, Model, Table, HasMany } from 'sequelize-typescript';
import { OrderDelivery } from './order-delivery.model';

@Table({ tableName: 'ordersStatuses', timestamps: false })
export class OrderStatus extends Model<OrderStatus> {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  id_status: number;

  @Column({ type: DataType.STRING })
  name: string;

  @HasMany(() => OrderDelivery)
  deliveries: OrderDelivery[];
}