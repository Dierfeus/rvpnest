import { Column, DataType, Model, Table, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Product } from './products.model';

@Table({ tableName: 'entrance', timestamps: true })
export class Entrance extends Model<Entrance> {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  id_entrance: number;

  @ForeignKey(() => Product)
  @Column({ type: DataType.INTEGER, allowNull: false })
  id_product: number;

  @Column({ type: DataType.DATE, allowNull: false })
  date: Date;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  purchase_price: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  quantity: number;

  @BelongsTo(() => Product)
  product: Product;
}