// categories.model.ts
import { ApiProperty } from '@nestjs/swagger';
import { Column, DataType, Model, Table, HasMany, ForeignKey, BelongsTo } from 'sequelize-typescript';

interface CategoryCreationAttrs {
  category: string;
  id_parent_category?: number | null;
  image_url?: string | null;
  icon_class?: string | null;
  description?: string | null;
}

@Table({ tableName: 'categories', timestamps: false })
export class Category extends Model<Category, CategoryCreationAttrs> {
  @ApiProperty({ example: 1, description: 'ID категории' })
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  id_category: number;

  @ApiProperty({ example: 'Ноутбуки', description: 'Название категории' })
  @Column({ type: DataType.STRING, allowNull: false })
  category: string;

  @ApiProperty({ example: null, description: 'ID родительской категории', nullable: true })
  @ForeignKey(() => Category)
  @Column({ type: DataType.INTEGER, allowNull: true })
  id_parent_category: number | null;

  @ApiProperty({
    example: 'https://example.com/images/laptops.jpg',
    description: 'Ссылка на картинку категории',
    nullable: true
  })
  @Column({ type: DataType.STRING, allowNull: true })
  image_url: string | null;

  @ApiProperty({
    example: 'fa-laptop',
    description: 'Класс иконки (FontAwesome)',
    nullable: true
  })
  @Column({ type: DataType.STRING, allowNull: true })
  icon_class: string | null;

  @ApiProperty({
    example: 'Ноутбуки всех брендов',
    description: 'Описание категории',
    nullable: true
  })
  @Column({ type: DataType.TEXT, allowNull: true })
  description: string | null;

  @BelongsTo(() => Category)
  parent: Category;

  @HasMany(() => Category)
  children: Category[];
}