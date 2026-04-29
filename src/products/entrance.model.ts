import { Column, DataType, Model, Table, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Product } from './products.model';

interface EntranceCreationAttrs {
  id_product: number;
  date: Date;
  purchase_price: number;
}

@Table({ tableName: 'entrance', timestamps: false })
export class Entrance extends Model<Entrance, EntranceCreationAttrs> {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  id_entrance: number;

  @ForeignKey(() => Product)
  @Column({ type: DataType.INTEGER })
  id_product: number;

  @Column({ type: DataType.DATE })
  date: Date;

  @Column({ type: DataType.DECIMAL(10, 2) })
  purchase_price: number;

  @BelongsTo(() => Product)
  product: Product;
}