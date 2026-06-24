import { Column, DataType, Model, Table, HasMany } from 'sequelize-typescript';
import { OrderDelivery } from './order-delivery.model';

@Table({ tableName: 'order_statuses', timestamps: false })
export class OrderStatus extends Model<OrderStatus> {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  declare id_status: number;

  @Column({ type: DataType.STRING, allowNull: false })
  declare name: string;

  @Column({ type: DataType.STRING, allowNull: true })
  declare description: string;

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  declare sort_order: number;

  @HasMany(() => OrderDelivery)
  declare deliveries: OrderDelivery[];
}