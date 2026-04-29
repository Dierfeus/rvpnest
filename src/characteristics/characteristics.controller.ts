import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { CharacteristicsService } from './characteristics.service';
import { CreateCharacteristicDto } from './dto/create-characteristic.dto';
import { CreateCharacteristicValueDto } from './dto/create-characteristics-value.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Характеристики')
@Controller('characteristics')
export class CharacteristicsController {
  constructor(private characteristicsService: CharacteristicsService) {}

  @ApiOperation({ summary: 'Создать характеристику' })
  @Post()
  createCharacteristic(@Body() dto: CreateCharacteristicDto) {
    return this.characteristicsService.createCharacteristic(dto);
  }

  @ApiOperation({ summary: 'Все характеристики' })
  @Get()
  getAllCharacteristics() {
    return this.characteristicsService.getAllCharacteristics();
  }

  @ApiOperation({ summary: 'Характеристика по id' })
  @Get(':id')
  getCharacteristicById(@Param('id') id: number) {
    return this.characteristicsService.getCharacteristicById(id);
  }

  @ApiOperation({ summary: 'Создать значение характеристики' })
  @Post('values')
  createCharacteristicValue(@Body() dto: CreateCharacteristicValueDto) {
    return this.characteristicsService.createCharacteristicValue(dto);
  }

  @ApiOperation({ summary: 'Значения по id характеристики' })
  @Get('values/characteristic/:id')
  getValuesByCharacteristicId(@Param('id') id: number) {
    return this.characteristicsService.getValuesByCharacteristicId(id);
  }
}