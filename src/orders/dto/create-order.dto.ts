import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, IsArray, ArrayMinSize } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({ example: 1, description: 'ID покупателя' })
  @IsNumber()
  readonly id_buyer: number;

  @ApiProperty({
    example: [1, 2, 3],
    description: 'Массив ID товаров из корзины для заказа',
    type: [Number]
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsNumber({}, { each: true })
  readonly cartItemIds: number[];

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
}