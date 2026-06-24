import { Column, DataType, ForeignKey, Model, Table, BelongsTo } from 'sequelize-typescript';
import { User } from '../users/users.model';
import { Product } from '../products/products.model';

@Table({ tableName: 'cart_items', timestamps: true })
export class CartItem extends Model<CartItem> {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  id_cart: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  id_user: number;

  @ForeignKey(() => Product)
  @Column({ type: DataType.INTEGER, allowNull: false })
  id_product: number;

  @Column({ type: DataType.INTEGER, defaultValue: 1 })
  quantity: number;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: true })
  price_snapshot: number;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  is_purchased: boolean;

  @Column({ type: DataType.DATE, allowNull: true })
  purchased_at: Date;

  @Column({ type: DataType.INTEGER, allowNull: true })
  id_discount: number;

  @Column({ type: DataType.DECIMAL(10, 2), defaultValue: 0 })
  discount_amount: number;

  @BelongsTo(() => User)
  user: User;

  @BelongsTo(() => Product)
  product: Product;
}