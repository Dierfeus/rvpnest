import { Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { User } from '../users/users.model';
import { Product } from '../products/products.model';

@Table({ tableName: 'cartItems', timestamps: false })
export class CartItem extends Model<CartItem> {
  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, primaryKey: true })
  id_user: number;

  @ForeignKey(() => Product)
  @Column({ type: DataType.INTEGER, primaryKey: true })
  id_product: number;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  item_deleted: boolean;
}