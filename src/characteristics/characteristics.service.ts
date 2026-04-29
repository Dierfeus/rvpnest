import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Characteristic } from './characteristics.model';
import { CharacteristicValue } from './characteristic-value.model';
import { CreateCharacteristicDto } from './dto/create-characteristic.dto';
import { CreateCharacteristicValueDto } from './dto/create-characteristics-value.dto';

@Injectable()
export class CharacteristicsService {
  constructor(
    @InjectModel(Characteristic) private characteristicRepository: typeof Characteristic,
    @InjectModel(CharacteristicValue) private characteristicValueRepository: typeof CharacteristicValue,
  ) {}

  // Характеристики
  async createCharacteristic(dto: CreateCharacteristicDto) {
    return this.characteristicRepository.create(dto);
  }

  async getAllCharacteristics() {
    return this.characteristicRepository.findAll({ include: ['values'] });
  }

  async getCharacteristicById(id: number) {
    return this.characteristicRepository.findByPk(id, { include: ['values'] });
  }

  // Значения характеристик
  async createCharacteristicValue(dto: CreateCharacteristicValueDto) {
    const characteristic = await this.characteristicRepository.findByPk(dto.id_characteristic);
    if (!characteristic) {
      throw new HttpException('Характеристика не найдена', HttpStatus.NOT_FOUND);
    }
    return this.characteristicValueRepository.create(dto);
  }

  async getValuesByCharacteristicId(id_characteristic: number) {
    return this.characteristicValueRepository.findAll({
      where: { id_characteristic },
      include: ['characteristic'],
    });
  }
}