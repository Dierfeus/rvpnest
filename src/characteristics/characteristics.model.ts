import { Column, DataType, Model, Table, HasMany } from 'sequelize-typescript';
import { CharacteristicValue } from './characteristic-value.model';

interface CharacteristicCreationAttrs {
  name: string;
  unit: string;
}

@Table({ tableName: 'characteristics', timestamps: false })
export class Characteristic extends Model<Characteristic, CharacteristicCreationAttrs> {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  id_characteristic: number;

  @Column({ type: DataType.STRING, allowNull: false })
  name: string;

  @Column({ type: DataType.STRING(50), allowNull: false })
  unit: string;

  @HasMany(() => CharacteristicValue)
  values: CharacteristicValue[];
}