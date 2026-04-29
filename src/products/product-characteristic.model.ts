import { Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Product } from './products.model';
import { CharacteristicValue } from '../characteristics/characteristic-value.model';

@Table({ tableName: 'productCharacteristics', timestamps: false })
export class ProductCharacteristic extends Model<ProductCharacteristic> {
  @ForeignKey(() => Product)
  @Column({ type: DataType.INTEGER, primaryKey: true })
  id_product: number;

  @ForeignKey(() => CharacteristicValue)
  @Column({ type: DataType.INTEGER, primaryKey: true })
  id_characters_value: number;
}