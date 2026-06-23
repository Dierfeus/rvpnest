import { ApiProperty } from '@nestjs/swagger';
import { Column, DataType, Model, Table, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Characteristic } from './characteristics.model';

interface CharacteristicValueCreationAttrs {
  id_characteristic: number;
  value: string;
  description?: string;
}

@Table({ tableName: 'characteristic_values', timestamps: true })
export class CharacteristicValue extends Model<CharacteristicValue, CharacteristicValueCreationAttrs> {
  @ApiProperty({ example: 1, description: 'ID значения' })
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  id_characters_value: number;

  @ApiProperty({ example: 1, description: 'ID характеристики' })
  @ForeignKey(() => Characteristic)
  @Column({ type: DataType.INTEGER, allowNull: false })
  id_characteristic: number;

  @ApiProperty({ example: '2.5', description: 'Значение' })
  @Column({ type: DataType.STRING, allowNull: false })
  value: string;

  @ApiProperty({ example: 'Стандартное значение', description: 'Описание значения' })
  @Column({ type: DataType.STRING, allowNull: true })
  description: string;

  @BelongsTo(() => Characteristic)
  characteristic: Characteristic;
}