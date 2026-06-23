import { Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Product } from '../products.model';
import { CharacteristicValue } from '../../characteristics/characteristic-value.model';

@Table({ tableName: 'product_characteristics', timestamps: true })
export class ProductCharacteristic extends Model<ProductCharacteristic> {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  declare id: number;

  @ForeignKey(() => Product)
  @Column({ type: DataType.INTEGER })
  declare  id_product: number;

  @ForeignKey(() => CharacteristicValue)
  @Column({ type: DataType.INTEGER })
  declare  id_characters_value: number;
}