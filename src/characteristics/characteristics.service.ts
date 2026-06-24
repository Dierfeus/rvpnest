import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Characteristic } from './characteristics.model';
import { CharacteristicValue } from './characteristic-value.model';
import { CreateCharacteristicDto } from './dto/create-characteristic.dto';
import { UpdateCharacteristicDto } from './dto/update-characteristic.dto';
import { CreateCharacteristicValueDto } from './dto/create-characteristics-value.dto';
import { UpdateCharacteristicValueDto } from './dto/update-characteristic-value.dto';
import { Op } from 'sequelize';

@Injectable()
export class CharacteristicsService {
  constructor(
      @InjectModel(Characteristic) private characteristicRepository: typeof Characteristic,
      @InjectModel(CharacteristicValue) private characteristicValueRepository: typeof CharacteristicValue,
  ) {}

  async createCharacteristic(dto: CreateCharacteristicDto) {
    const existing = await this.characteristicRepository.findOne({
      where: { name: dto.name }
    });
    if (existing) {
      throw new HttpException('Характеристика с таким названием уже существует', HttpStatus.BAD_REQUEST);
    }
    return this.characteristicRepository.create(dto as any);
  }

  async getAllCharacteristics(group?: string) {
    const where: any = {};
    if (group) {
      where.group = group;
    }
    return this.characteristicRepository.findAll({
      where,
      include: ['values'],
      order: [['group', 'ASC'], ['name', 'ASC']]
    });
  }

  async getCharacteristicById(id: number) {
    const characteristic = await this.characteristicRepository.findByPk(id, {
      include: ['values']
    });
    if (!characteristic) {
      throw new HttpException('Характеристика не найдена', HttpStatus.NOT_FOUND);
    }
    return characteristic;
  }

  async updateCharacteristic(id: number, dto: UpdateCharacteristicDto) {
    const characteristic = await this.getCharacteristicById(id);

    if (dto.name) {
      const existing = await this.characteristicRepository.findOne({
        where: {
          name: dto.name,
          id_characteristic: { [Op.ne]: id }
        }
      });
      if (existing) {
        throw new HttpException('Характеристика с таким названием уже существует', HttpStatus.BAD_REQUEST);
      }
    }

    await characteristic.update(dto);
    return this.getCharacteristicById(id);
  }

  async deleteCharacteristic(id: number) {
    const characteristic = await this.getCharacteristicById(id);
    const values = await this.characteristicValueRepository.findAll({
      where: { id_characteristic: id }
    });
    if (values.length > 0) {
      throw new HttpException(
          'Нельзя удалить характеристику, у которой есть значения. Сначала удалите значения.',
          HttpStatus.BAD_REQUEST
      );
    }

    await characteristic.destroy();
    return { message: 'Характеристика удалена' };
  }

  async getCharacteristicGroups() {
    const groups = await this.characteristicRepository.findAll({
      attributes: ['group'],
      group: ['group'],
      where: {
        group: { [Op.ne]: null as any }
      }
    });
    return groups.map(g => g.get('group')).filter(Boolean);
  }

  async createCharacteristicValue(dto: CreateCharacteristicValueDto) {
    const characteristic = await this.characteristicRepository.findByPk(dto.id_characteristic);
    if (!characteristic) {
      throw new HttpException('Характеристика не найдена', HttpStatus.NOT_FOUND);
    }

    // Проверяем, есть ли уже такое значение
    const existing = await this.characteristicValueRepository.findOne({
      where: {
        id_characteristic: dto.id_characteristic,
        value: dto.value
      }
    });
    if (existing) {
      throw new HttpException('Такое значение уже существует для этой характеристики', HttpStatus.BAD_REQUEST);
    }

    return this.characteristicValueRepository.create(dto as any);
  }

  async getCharacteristicValueById(id: number) {
    const value = await this.characteristicValueRepository.findByPk(id, {
      include: ['characteristic']
    });
    if (!value) {
      throw new HttpException('Значение характеристики не найдено', HttpStatus.NOT_FOUND);
    }
    return value;
  }

  async getValuesByCharacteristicId(id_characteristic: number) {
    const characteristic = await this.characteristicRepository.findByPk(id_characteristic);
    if (!characteristic) {
      throw new HttpException('Характеристика не найдена', HttpStatus.NOT_FOUND);
    }
    return this.characteristicValueRepository.findAll({
      where: { id_characteristic },
      include: ['characteristic'],
      order: [['value', 'ASC']]
    });
  }

  async updateCharacteristicValue(id: number, dto: UpdateCharacteristicValueDto) {
    const value = await this.getCharacteristicValueById(id);

    if (dto.value) {
      const existing = await this.characteristicValueRepository.findOne({
        where: {
          id_characteristic: value.id_characteristic,
          value: dto.value,
          id_characters_value: { [Op.ne]: id }
        }
      });
      if (existing) {
        throw new HttpException('Такое значение уже существует для этой характеристики', HttpStatus.BAD_REQUEST);
      }
    }

    await value.update(dto);
    return this.getCharacteristicValueById(id);
  }

  async deleteCharacteristicValue(id: number) {
    const value = await this.getCharacteristicValueById(id);
    await value.destroy();
    return { message: 'Значение характеристики удалено' };
  }

  async searchCharacteristics(query: string) {
    return this.characteristicRepository.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: `%${query}%` } },
          { group: { [Op.iLike]: `%${query}%` } }
        ]
      },
      include: ['values']
    });
  }
}