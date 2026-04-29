import { Column, DataType, Model, Table, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { DiscountType } from './discount-type.model';

interface DiscountCreationAttrs {
  id_discountsType: number;
  name: string;
  size: number;
  start_time: Date;
  end_time: Date;
}

@Table({ tableName: 'discounts', timestamps: false })
export class Discount extends Model<Discount, DiscountCreationAttrs> {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  id_discount: number;

  @ForeignKey(() => DiscountType)
  @Column({ type: DataType.INTEGER })
  id_discountsType: number;

  @Column({ type: DataType.STRING })
  name: string;

  @Column({ type: DataType.FLOAT })
  size: number;

  @Column({ type: DataType.DATE })
  start_time: Date;

  @Column({ type: DataType.DATE })
  end_time: Date;

  @BelongsTo(() => DiscountType)
  discountType: DiscountType;
}