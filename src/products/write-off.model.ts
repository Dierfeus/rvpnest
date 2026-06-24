import { ApiProperty } from '@nestjs/swagger';
import { Column, DataType, Model, Table, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Product } from './products.model';
import { Order } from '../orders/order.model';

interface WriteOffCreationAttrs {
    id_product: number;
    id_order: number;
    date: Date;
    quantity: number;
    reason: string;
}

@Table({ tableName: 'write_offs', timestamps: true })
export class WriteOff extends Model<WriteOff, WriteOffCreationAttrs> {
    @ApiProperty({ example: 1, description: 'ID записи списания' })
    @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
    id_write_off: number;

    @ApiProperty({ example: 1, description: 'ID товара' })
    @ForeignKey(() => Product)
    @Column({ type: DataType.INTEGER, allowNull: false })
    id_product: number;

    @ApiProperty({ example: 1, description: 'ID заказа' })
    @ForeignKey(() => Order)
    @Column({ type: DataType.INTEGER, allowNull: false })
    id_order: number;

    @ApiProperty({ example: '2025-01-15T10:00:00Z', description: 'Дата списания' })
    @Column({ type: DataType.DATE, allowNull: false })
    date: Date;

    @ApiProperty({ example: 5, description: 'Количество списания' })
    @Column({ type: DataType.INTEGER, allowNull: false })
    quantity: number;

    @ApiProperty({ example: 'Продажа по заказу #123', description: 'Причина списания' })
    @Column({ type: DataType.STRING, allowNull: true })
    reason: string;

    @BelongsTo(() => Product)
    product: Product;

    @BelongsTo(() => Order)
    order: Order;
}