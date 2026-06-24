import { Column, DataType, Model, Table, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { Category } from '../categories/categories.model';
import { User } from '../users/users.model';
import { Entrance } from './entrance.model';
import { WriteOff } from './write-off.model';

@Table({ tableName: 'products', timestamps: true })
export class Product extends Model<Product> {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  id_product: number;

  @Column({ type: DataType.STRING, allowNull: false })
  name: string;

  @ForeignKey(() => Category)
  @Column({ type: DataType.INTEGER })
  id_category: number;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  price: number;

  @Column({ type: DataType.TEXT, allowNull: true })
  description: string;

  @Column({ type: DataType.JSON, allowNull: true })
  images: string[];

  @Column({ type: DataType.STRING, allowNull: true })
  condition: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER })
  id_user: number;

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  is_active: boolean;

  @BelongsTo(() => Category)
  category: Category;

  @BelongsTo(() => User)
  user: User;

  @HasMany(() => Entrance)
  entrances: Entrance[];

  @HasMany(() => WriteOff)
  write_offs: WriteOff[];
}