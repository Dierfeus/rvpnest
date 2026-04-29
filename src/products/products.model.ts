import { Column, DataType, Model, Table, ForeignKey, BelongsTo, BelongsToMany, HasMany } from 'sequelize-typescript';
import { Category } from '../categories/categories.model';
import { CharacteristicValue } from '../characteristics/characteristic-value.model';
import { ProductCharacteristic } from './product-characteristic.model';
import { Entrance } from './entrance.model';

interface ProductCreationAttrs {
  name: string;
  id_category: number;
  price: number;
  description?: string;
}

@Table({ tableName: 'products', timestamps: false })
export class Product extends Model<Product, ProductCreationAttrs> {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  id_product: number;

  @Column({ type: DataType.STRING, allowNull: false })
  name: string;

  @ForeignKey(() => Category)
  @Column({ type: DataType.INTEGER })
  id_category: number;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  price: number;

  @Column({ type: DataType.STRING, allowNull: true })
  description: string;

  @BelongsTo(() => Category)
  category: Category;

  @BelongsToMany(() => CharacteristicValue, () => ProductCharacteristic)
  characteristicValues: CharacteristicValue[];

  @HasMany(() => Entrance)
  entrances: Entrance[];
}