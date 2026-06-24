import { ApiProperty } from '@nestjs/swagger';
import { Column, DataType, Model, Table, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Product } from './products.model';

interface EntranceCreationAttrs {
  id_product: number;
  date: Date;
  purchase_price: number;
  quantity: number; // добавляем количество
}

@Table({ tableName: 'entrance', timestamps: false })
export class Entrance extends Model<Entrance, EntranceCreationAttrs> {
  @ApiProperty({ example: 1, description: 'ID записи прихода' })
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  id_entrance: number;

  @ApiProperty({ example: 1, description: 'ID товара' })
  @ForeignKey(() => Product)
  @Column({ type: DataType.INTEGER })
  id_product: number;

  @ApiProperty({ example: '2025-01-15T10:00:00Z', description: 'Дата прихода' })
  @Column({ type: DataType.DATE })
  date: Date;

  @ApiProperty({ example: 450.00, description: 'Цена закупки' })
  @Column({ type: DataType.DECIMAL(10, 2) })
  purchase_price: number;

  @ApiProperty({ example: 10, description: 'Количество поступления' })
  @Column({ type: DataType.INTEGER, defaultValue: 1 })
  quantity: number;

  @BelongsTo(() => Product)
  product: Product;
}