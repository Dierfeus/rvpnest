import { Column, DataType, Model, Table, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { User } from '../users/users.model';
import { Discount } from '../discounts/discount.model';
import { OrderItem } from './order-item.model';
import { OrderDelivery } from './order-delivery.model';

interface OrderCreationAttrs {
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
  id_order: number;

  // id_seller удален - магазин сам является продавцом

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER })
  id_buyer: number;

  @Column({ type: DataType.DATEONLY })
  date: Date;

  @ForeignKey(() => Discount)
  @Column({ type: DataType.INTEGER, allowNull: true })
  id_discount: number;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  subtotal_amount: number;

  @Column({ type: DataType.DECIMAL(10, 2), defaultValue: 0 })
  discount_amount: number;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  total_amount: number;

  @Column({ type: DataType.TEXT, allowNull: false })
  shipping_address: string;

  @Column({ type: DataType.STRING, allowNull: false })
  payment_method: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  comment: string;

  @BelongsTo(() => User, { as: 'buyer', foreignKey: 'id_buyer' })
  buyer: User;

  @BelongsTo(() => Discount)
  discount: Discount;

  @HasMany(() => OrderItem)
  items: OrderItem[];

  @HasMany(() => OrderDelivery)
  deliveries: OrderDelivery[];
}