import { Column, DataType, Model, Table, ForeignKey, BelongsTo, BelongsToMany, HasMany } from 'sequelize-typescript';
import { Category } from '../categories/categories.model';
import { CharacteristicValue } from '../characteristics/characteristic-value.model';
import { ProductCharacteristic } from './product-characteristic.model';
import { Entrance } from './entrance.model';
import { ProductDiscount } from '../discounts/product-discount.model';
import { OrderItem } from '../orders/order-item.model';
import { CartItem } from '../cart/cart-item.model';

interface ProductCreationAttrs {
  name: string;
  id_category: number;
  price: number;
  description?: string;
  id_user?: number;
  images?: string[];
  condition?: string;
  is_active?: boolean;
}

@Table({ tableName: 'products', timestamps: true })
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

  @Column({ type: DataType.TEXT, allowNull: true })
  description: string;

  @Column({ type: DataType.ARRAY(DataType.STRING), allowNull: true })
  images: string[];

  @Column({ type: DataType.STRING, allowNull: true })
  condition: string;

  @Column({ type: DataType.INTEGER, allowNull: true })
  id_user: number; // Продавец

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  stock: number;

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  is_active: boolean;

  @BelongsTo(() => Category)
  category: Category;

  @BelongsToMany(() => CharacteristicValue, () => ProductCharacteristic)
  characteristicValues: CharacteristicValue[];

  @HasMany(() => Entrance)
  entrances: Entrance[];

  @HasMany(() => ProductDiscount)
  productDiscounts: ProductDiscount[];

  @HasMany(() => OrderItem)
  orderItems: OrderItem[];

  @HasMany(() => CartItem)
  cartItems: CartItem[];
}