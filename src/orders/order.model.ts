import { Column, DataType, Model, Table, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { User } from '../users/users.model';
import { Discount } from '../discounts/discount.model';
import { OrderItem } from './order-item.model';
import { OrderDelivery } from './order-delivery.model';

interface OrderCreationAttrs {
  id_seller: number;
  id_buyer: number;
  date: Date;
  id_discount?: number;
}

@Table({ tableName: 'orders', timestamps: false })
export class Order extends Model<Order, OrderCreationAttrs> {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  id_order: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER })
  id_seller: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER })
  id_buyer: number;

  @Column({ type: DataType.DATEONLY })
  date: Date;

  @ForeignKey(() => Discount)
  @Column({ type: DataType.INTEGER })
  id_discount: number;

  @BelongsTo(() => User, { as: 'seller', foreignKey: 'id_seller' })
  seller: User;

  @BelongsTo(() => User, { as: 'buyer', foreignKey: 'id_buyer' })
  buyer: User;

  @BelongsTo(() => Discount)
  discount: Discount;

  @HasMany(() => OrderItem)
  items: OrderItem[];

  @HasMany(() => OrderDelivery)
  deliveries: OrderDelivery[];
}