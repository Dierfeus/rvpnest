import { ApiProperty } from '@nestjs/swagger';
import { Column, DataType, Model, Table, HasMany } from 'sequelize-typescript';
import { CharacteristicValue } from './characteristic-value.model';

interface CharacteristicCreationAttrs {
  name: string;
  unit?: string;
  group?: string;
}

@Table({ tableName: 'characteristics', timestamps: true })
export class Characteristic extends Model<Characteristic, CharacteristicCreationAttrs> {
  @ApiProperty({ example: 1, description: 'ID характеристики' })
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  id_characteristic: number;

  @ApiProperty({ example: 'Вес', description: 'Название характеристики' })
  @Column({ type: DataType.STRING, allowNull: false })
  name: string;

  @ApiProperty({ example: 'кг', description: 'Единица измерения' })
  @Column({ type: DataType.STRING(50), allowNull: true })
  unit: string;

  @ApiProperty({ example: 'Физические параметры', description: 'Группа характеристики' })
  @Column({ type: DataType.STRING, allowNull: true })
  group: string;

  @HasMany(() => CharacteristicValue)
  values: CharacteristicValue[];
}