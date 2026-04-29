import { Column, DataType, Model, Table, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Characteristic } from './characteristics.model';

interface CharacteristicValueCreationAttrs {
  id_characteristic: number;
  value: string;
}

@Table({ tableName: 'characteristicValues', timestamps: false })
export class CharacteristicValue extends Model<CharacteristicValue, CharacteristicValueCreationAttrs> {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  id_characters_value: number;

  @ForeignKey(() => Characteristic)
  @Column({ type: DataType.INTEGER, allowNull: false })
  id_characteristic: number;

  @Column({ type: DataType.STRING, allowNull: false })
  value: string;

  @BelongsTo(() => Characteristic)
  characteristic: Characteristic;
}