import { Column, DataType, ForeignKey, Model, Table, BelongsTo } from 'sequelize-typescript';
import { User } from '../users/users.model';
import { Product } from '../products/products.model';

@Table({ tableName: 'cart_items', timestamps: true })
export class CartItem extends Model<CartItem> {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  declare id_cart: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare id_user: number;

  @ForeignKey(() => Product)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare id_product: number;

  @Column({ type: DataType.INTEGER, defaultValue: 1 })
  declare quantity: number;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: true })
  declare price_snapshot: number;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  declare is_purchased: boolean;

  @Column({ type: DataType.DATE, allowNull: true })
  declare purchased_at: Date;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare id_discount: number;

  @Column({ type: DataType.DECIMAL(10, 2), defaultValue: 0 })
  declare discount_amount: number;

  @BelongsTo(() => User)
  declare user: User;

  @BelongsTo(() => Product)
  declare product: Product;
}