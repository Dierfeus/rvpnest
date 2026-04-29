import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Product } from './products.model';
import { ProductCharacteristic } from './product-characteristic.model';
import { Entrance } from './entrance.model';
import { CreateProductDto } from './dto/create-product.dto';
import { AddProductCharacteristicDto } from './dto/add-product-characteristic.dto';
import { CreateEntranceDto } from './dto/create-entrance.dto';
import { CategoriesService } from '../categories/categories.service';
import { CharacteristicsService } from '../characteristics/characteristics.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product) private productRepository: typeof Product,
    @InjectModel(ProductCharacteristic) private productCharacteristicRepository: typeof ProductCharacteristic,
    @InjectModel(Entrance) private entranceRepository: typeof Entrance,
    private categoriesService: CategoriesService,
    private characteristicsService: CharacteristicsService,
  ) {}

  async create(dto: CreateProductDto) {
    const category = await this.categoriesService.getOne(dto.id_category);
    if (!category) throw new HttpException('Категория не найдена', HttpStatus.NOT_FOUND);
    return this.productRepository.create(dto as any);
  }

  async getAll() {
    return this.productRepository.findAll({
      include: ['category', 'characteristicValues', 'entrances'],
    });
  }

  async getOne(id: number) {
    const product = await this.productRepository.findByPk(id, {
      include: ['category', 'characteristicValues', 'entrances'],
    });
    if (!product) throw new HttpException('Товар не найден', HttpStatus.NOT_FOUND);
    return product;
  }

  async addCharacteristic(dto: AddProductCharacteristicDto) {
    const product = await this.productRepository.findByPk(dto.id_product);
    if (!product) throw new HttpException('Товар не найден', HttpStatus.NOT_FOUND);
  
    const charValue = await this.characteristicsService.getCharacteristicById(dto.id_characters_value);
    if (!charValue) throw new HttpException('Значение характеристики не найдено', HttpStatus.NOT_FOUND);
  
    // Исправлено: используем create с правильной типизацией
    // @ts-ignore - игнорируем ошибку TypeScript, так как Sequelize принимает plain object
    await this.productCharacteristicRepository.create({
      id_product: dto.id_product,
      id_characters_value: dto.id_characters_value,
    } as any);
    
    return { message: 'Характеристика добавлена к товару' };
  }

  async createEntrance(dto: CreateEntranceDto) {
    const product = await this.productRepository.findByPk(dto.id_product);
    if (!product) throw new HttpException('Товар не найден', HttpStatus.NOT_FOUND);
  
    // Исправлено: создаём объект для вставки
    const entranceData = {
      id_product: dto.id_product,
      date: new Date(dto.date),
      purchase_price: dto.purchase_price,
    };
  
    // @ts-ignore - игнорируем ошибку TypeScript
    return this.entranceRepository.create(entranceData as any);
  }

  async getEntrancesByProduct(id_product: number) {
    return this.entranceRepository.findAll({ 
      where: { id_product }, 
      include: ['product'] 
    });
  }
}