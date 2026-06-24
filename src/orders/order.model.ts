import { Column, DataType, Model, Table, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { User } from '../users/users.model';
import { Discount } from '../discounts/discount.model';
import { OrderItem } from './order-item.model';
import { OrderDelivery } from './order-delivery.model';

export interface OrderCreationAttrs {
  id_buyer: number;
  date: Date;
  id_discount?: number;
  subtotal_amount: number;
  discount_amount: number;
  total_amount: number;
  shipping_address: string;
  payment_method: string;
  comment?: string;
}

@Table({ tableName: 'orders', timestamps: true })
export class Order extends Model<Order, OrderCreationAttrs> {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  declare id_order: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER })
  declare id_buyer: number;

  @Column({ type: DataType.DATEONLY })
  declare date: Date;

  @ForeignKey(() => Discount)
  @Column({ type: DataType.INTEGER, allowNull: true })
  declare id_discount: number;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  declare subtotal_amount: number;

  @Column({ type: DataType.DECIMAL(10, 2), defaultValue: 0 })
  declare discount_amount: number;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  declare total_amount: number;

  @Column({ type: DataType.TEXT, allowNull: false })
  declare shipping_address: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare payment_method: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare comment: string;

  @BelongsTo(() => User, { as: 'buyer', foreignKey: 'id_buyer' })
  declare buyer: User;

  @BelongsTo(() => Discount)
  declare discount: Discount;

  @HasMany(() => OrderItem)
  declare items: OrderItem[];

  @HasMany(() => OrderDelivery)
  declare deliveries: OrderDelivery[];
}