import {
  Controller, Get, Post, Body, Param, Put, Delete,
  UseGuards, HttpCode, HttpStatus, Query
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth,
  ApiParam, ApiBody, ApiQuery, ApiOkResponse, ApiCreatedResponse,
  ApiNotFoundResponse, ApiBadRequestResponse, ApiForbiddenResponse
} from '@nestjs/swagger';
import { CharacteristicsService } from './characteristics.service';
import { CreateCharacteristicDto } from './dto/create-characteristic.dto';
import { UpdateCharacteristicDto } from './dto/update-characteristic.dto';
import { CreateCharacteristicValueDto } from './dto/create-characteristics-value.dto';
import { UpdateCharacteristicValueDto } from './dto/update-characteristic-value.dto';
import { Characteristic } from './characteristics.model';
import { CharacteristicValue } from './characteristic-value.model';
import { Roles } from '../auth/roles-auth.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Характеристики')
@Controller('characteristics')
export class CharacteristicsController {
  constructor(private characteristicsService: CharacteristicsService) {}

  @Get()
  @ApiOperation({
    summary: 'Получить все характеристики',
    description: 'Возвращает список всех характеристик с их значениями.'
  })
  @ApiQuery({
    name: 'group',
    required: false,
    type: String,
    description: 'Фильтр по группе'
  })
  @ApiOkResponse({
    type: [Characteristic],
    description: 'Список характеристик'
  })
  getAllCharacteristics(@Query('group') group?: string) {
    return this.characteristicsService.getAllCharacteristics(group);
  }

  @Get('groups')
  @ApiOperation({
    summary: 'Получить все группы характеристик'
  })
  @ApiOkResponse({
    schema: {
      example: ['Физические параметры', 'Технические характеристики', 'Дисплей']
    }
  })
  getGroups() {
    return this.characteristicsService.getCharacteristicGroups();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Получить характеристику по ID'
  })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiOkResponse({ type: Characteristic })
  @ApiNotFoundResponse({ description: 'Характеристика не найдена' })
  getCharacteristicById(@Param('id') id: number) {
    return this.characteristicsService.getCharacteristicById(id);
  }

  @Get('values/characteristic/:id')
  @ApiOperation({
    summary: 'Получить значения характеристики по ID характеристики'
  })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiOkResponse({ type: [CharacteristicValue] })
  getValuesByCharacteristicId(@Param('id') id: number) {
    return this.characteristicsService.getValuesByCharacteristicId(id);
  }

  @Get('values/:id')
  @ApiOperation({
    summary: 'Получить значение характеристики по ID'
  })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiOkResponse({ type: CharacteristicValue })
  @ApiNotFoundResponse({ description: 'Значение не найдено' })
  getCharacteristicValueById(@Param('id') id: number) {
    return this.characteristicsService.getCharacteristicValueById(id);
  }

  @Get('search/:query')
  @ApiOperation({
    summary: 'Поиск характеристик'
  })
  @ApiParam({ name: 'query', type: 'string' })
  searchCharacteristics(@Param('query') query: string) {
    return this.characteristicsService.searchCharacteristics(query);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Создать характеристику (Админ)'
  })
  @ApiBody({ type: CreateCharacteristicDto })
  @ApiCreatedResponse({ type: Characteristic })
  @ApiBadRequestResponse({ description: 'Характеристика уже существует' })
  createCharacteristic(@Body() dto: CreateCharacteristicDto) {
    return this.characteristicsService.createCharacteristic(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Обновить характеристику (Админ)'
  })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiBody({ type: UpdateCharacteristicDto })
  @ApiOkResponse({ type: Characteristic })
  @ApiNotFoundResponse({ description: 'Характеристика не найдена' })
  updateCharacteristic(
      @Param('id') id: number,
      @Body() dto: UpdateCharacteristicDto
  ) {
    return this.characteristicsService.updateCharacteristic(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Удалить характеристику (Админ)'
  })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiNotFoundResponse({ description: 'Характеристика не найдена' })
  deleteCharacteristic(@Param('id') id: number) {
    return this.characteristicsService.deleteCharacteristic(id);
  }

  @Post('values')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Создать значение характеристики (Админ)'
  })
  @ApiBody({ type: CreateCharacteristicValueDto })
  @ApiCreatedResponse({ type: CharacteristicValue })
  @ApiNotFoundResponse({ description: 'Характеристика не найдена' })
  createCharacteristicValue(@Body() dto: CreateCharacteristicValueDto) {
    return this.characteristicsService.createCharacteristicValue(dto);
  }

  @Put('values/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Обновить значение характеристики (Админ)'
  })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiBody({ type: UpdateCharacteristicValueDto })
  @ApiOkResponse({ type: CharacteristicValue })
  @ApiNotFoundResponse({ description: 'Значение не найдено' })
  updateCharacteristicValue(
      @Param('id') id: number,
      @Body() dto: UpdateCharacteristicValueDto
  ) {
    return this.characteristicsService.updateCharacteristicValue(id, dto);
  }

  @Delete('values/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Удалить значение характеристики (Админ)'
  })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiNotFoundResponse({ description: 'Значение не найдено' })
  deleteCharacteristicValue(@Param('id') id: number) {
    return this.characteristicsService.deleteCharacteristicValue(id);
  }
}