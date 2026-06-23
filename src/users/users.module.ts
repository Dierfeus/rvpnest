import { Column, DataType, ForeignKey, Model, Table, BelongsTo } from 'sequelize-typescript';
import { User } from '../users/users.model';
import { Product } from '../products/products.model';

@Table({ tableName: 'cart_items', timestamps: true })
export class CartItem extends Model<CartItem> {
    @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
    id_cart: number;

    @ForeignKey(() => User)
    @Column({ type: DataType.INTEGER, allowNull: false })
    id_user: number;

    @ForeignKey(() => Product)
    @Column({ type: DataType.INTEGER, allowNull: false })
    id_product: number;

    @Column({ type: DataType.INTEGER, defaultValue: 1 })
    quantity: number;

    @Column({ type: DataType.BOOLEAN, defaultValue: false })
    is_purchased: boolean; // Помечает, что товар куплен

    @Column({ type: DataType.DATE, allowNull: true })
    purchased_at: Date; // Дата покупки

    @BelongsTo(() => User)
    user: User;

    @BelongsTo(() => Product)
    product: Product;
}