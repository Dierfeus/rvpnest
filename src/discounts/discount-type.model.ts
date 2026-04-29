import { Column, DataType, Model, Table, HasMany } from 'sequelize-typescript';
import { Discount } from './discount.model';

@Table({ tableName: 'discountsType', timestamps: false })
export class DiscountType extends Model<DiscountType> {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  id_discountsType: number;

  @Column({ type: DataType.STRING })
  name: string;

  @HasMany(() => Discount)
  discounts: Discount[];
}