import { Column, DataType, Model, Table, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { DiscountType } from './discount-type.model';
import { ProductDiscount } from './product-discount.model';

interface DiscountCreationAttrs {
  id_discountsType: number;
  name: string;
  size: number;
  start_time: Date;
  end_time: Date;
  code?: string;
  type?: 'percentage' | 'fixed';
  min_order_amount?: number;
  max_discount_amount?: number;
  usage_limit?: number;
  used_count?: number;
  is_active?: boolean;
}

@Table({ tableName: 'discounts', timestamps: true })
export class Discount extends Model<Discount, DiscountCreationAttrs> {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  id_discount: number;

  @ForeignKey(() => DiscountType)
  @Column({ type: DataType.INTEGER })
  id_discountsType: number;

  @Column({ type: DataType.STRING, allowNull: false })
  name: string;

  @Column({ type: DataType.STRING, allowNull: true, unique: true })
  code: string;

  @Column({ type: DataType.ENUM('percentage', 'fixed'), defaultValue: 'percentage' })
  type: 'percentage' | 'fixed';

  @Column({ type: DataType.FLOAT, allowNull: false })
  size: number;

  @Column({ type: DataType.DATE, allowNull: false })
  start_time: Date;

  @Column({ type: DataType.DATE, allowNull: false })
  end_time: Date;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: true })
  min_order_amount: number;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: true })
  max_discount_amount: number;

  @Column({ type: DataType.INTEGER, allowNull: true })
  usage_limit: number;

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  used_count: number;

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  is_active: boolean;

  @BelongsTo(() => DiscountType)
  discountType: DiscountType;

  @HasMany(() => ProductDiscount)
  productDiscounts: ProductDiscount[];
}