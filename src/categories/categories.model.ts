import { Column, DataType, Model, Table, HasMany, ForeignKey, BelongsTo } from 'sequelize-typescript';

interface CategoryCreationAttrs {
  category: string;
  id_parent_category?: number;
}

@Table({ tableName: 'categories', timestamps: false })
export class Category extends Model<Category, CategoryCreationAttrs> {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  id_category: number;

  @Column({ type: DataType.STRING, allowNull: false })
  category: string;

  @ForeignKey(() => Category)
  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  id_parent_category: number;

  @BelongsTo(() => Category)
  parent: Category;

  @HasMany(() => Category)
  children: Category[];
}