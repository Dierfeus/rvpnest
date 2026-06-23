import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, IsArray, ArrayMinSize, IsDecimal } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({ example: 2, description: 'ID продавца' })
  @IsNumber()
  readonly id_seller: number;

  @ApiProperty({ example: 1, description: 'ID покупателя' })
  @IsNumber()
  readonly id_buyer: number;

  @ApiProperty({ example: 3, required: false, description: 'ID скидки' })
  @IsOptional()
  @IsNumber()
  readonly id_discount?: number;

  @ApiProperty({ example: 'г. Москва, ул. Ленина, д. 1, кв. 10', description: 'Адрес доставки' })
  @IsString()
  readonly shipping_address: string;

  @ApiProperty({ example: 'card', description: 'Способ оплаты (card, cash, etc.)' })
  @IsString()
  readonly payment_method: string;

  @ApiProperty({ example: 'Доставка с 10:00 до 18:00', required: false })
  @IsOptional()
  @IsString()
  readonly comment?: string;

  @ApiProperty({ example: [1, 3, 5], description: 'ID товаров из корзины' })
  @IsArray()
  @ArrayMinSize(1)
  @IsNumber({}, { each: true })
  readonly cartItemIds: number[];
}