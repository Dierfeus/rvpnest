import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Product } from './products.model';
import { ProductCharacteristic } from './product-characteristic.model';
import { Entrance } from './entrance.model';
import { WriteOff } from './write-off.model';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AddProductCharacteristicDto } from './dto/add-product-characteristic.dto';
import { CreateEntranceDto } from './dto/create-entrance.dto';
import { CategoriesService } from '../categories/categories.service';
import { CharacteristicsService } from '../characteristics/characteristics.service';
import { Op, Sequelize } from 'sequelize';

@Injectable()
export class ProductsService {
  constructor(
      @InjectModel(Product) private productRepository: typeof Product,
      @InjectModel(ProductCharacteristic) private productCharacteristicRepository: typeof ProductCharacteristic,
      @InjectModel(Entrance) private entranceRepository: typeof Entrance,
      @InjectModel(WriteOff) private writeOffRepository: typeof WriteOff,
      private categoriesService: CategoriesService,
      private characteristicsService: CharacteristicsService,
  ) {}

  async create(dto: CreateProductDto) {
    const category = await this.categoriesService.getOne(dto.id_category);
    if (!category) {
      throw new HttpException('Категория не найдена', HttpStatus.NOT_FOUND);
    }
    return this.productRepository.create(dto as any);
  }

  async getAll(filters?: {
    categoryId?: number;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: any = { is_active: true };

    if (filters?.categoryId) {
      where.id_category = filters.categoryId;
    }

    if (filters?.minPrice !== undefined) {
      where.price = { [Op.gte]: filters.minPrice };
    }

    if (filters?.maxPrice !== undefined) {
      where.price = { ...where.price, [Op.lte]: filters.maxPrice };
    }

    if (filters?.search) {
      where.name = { [Op.iLike]: `%${filters.search}%` };
    }

    const products = await this.productRepository.findAll({
      where,
      include: [
        'category',
        {
          association: 'characteristicValues',
          include: ['characteristic']
        },
        'entrances'
      ],
      limit: filters?.limit || 20,
      offset: filters?.offset || 0,
      order: [['createdAt', 'DESC']]
    });
    return products.map(product => product.toJSON());
  }

  async getOne(id: number) {
    const product = await this.productRepository.findByPk(id, {
      include: [
        'category',
        {
          association: 'characteristicValues',
          include: ['characteristic']
        },
        'entrances'
      ],
    });
    if (!product) {
      throw new HttpException('Товар не найден', HttpStatus.NOT_FOUND);
    }
    return product.toJSON();
  }

  async getProductPrice(id: number): Promise<{ price: number }> {
    const product = await this.productRepository.findByPk(id, {
      attributes: ['price']
    });
    if (!product) {
      throw new HttpException('Товар не найден', HttpStatus.NOT_FOUND);
    }
    return { price: parseFloat(String(product.getDataValue('price'))) || 0 };
  }

  async update(id: number, dto: UpdateProductDto) {
    const product = await this.productRepository.findByPk(id);
    if (!product) {
      throw new HttpException('Товар не найден', HttpStatus.NOT_FOUND);
    }
    await product.update(dto);
    return this.getOne(id);
  }

  async delete(id: number) {
    const product = await this.getOne(id);
    await this.productRepository.destroy({ where: { id_product: id } });
    return { message: 'Товар удален' };
  }

  // ==================== УЧЕТ ТОВАРОВ ====================

  // Получить текущий остаток товара
  async getStock(productId: number): Promise<number> {
    const product = await this.productRepository.findByPk(productId);
    if (!product) {
      throw new HttpException('Товар не найден', HttpStatus.NOT_FOUND);
    }
    return product.getDataValue('stock') || 0;
  }

  async checkStock(productId: number, quantity: number = 1): Promise<boolean> {
    const currentStock = await this.getStock(productId);
    return currentStock >= quantity;
  }

  async checkMultipleStock(items: { productId: number; quantity: number }[]): Promise<{
    available: boolean;
    insufficient: { productId: number; name: string; available: number; required: number }[];
  }> {
    const insufficient: { productId: number; name: string; available: number; required: number }[] = [];

    for (const item of items) {
      const product = await this.productRepository.findByPk(item.productId);
      if (!product) {
        throw new HttpException(`Товар с ID ${item.productId} не найден`, HttpStatus.NOT_FOUND);
      }
      const currentStock = product.getDataValue('stock') || 0;
      if (currentStock < item.quantity) {
        insufficient.push({
          productId: item.productId,
          name: product.getDataValue('name'),
          available: currentStock,
          required: item.quantity
        });
      }
    }
    return {
      available: insufficient.length === 0,
      insufficient
    };
  }

  // Создать приход товара
  async createEntrance(dto: CreateEntranceDto) {
    const product = await this.productRepository.findByPk(dto.id_product);
    if (!product) {
      throw new HttpException('Товар не найден', HttpStatus.NOT_FOUND);
    }

    const quantity = dto.quantity || 1;

    // Создаем запись прихода
    const entrance = await this.entranceRepository.create({
      id_product: dto.id_product,
      date: new Date(dto.date),
      purchase_price: dto.purchase_price,
      quantity: quantity,
    } as any);

    // Обновляем остаток
    const currentStock = product.getDataValue('stock') || 0;
    await product.update({
      stock: currentStock + quantity
    });

    return entrance.toJSON();
  }

  // Создать списание товара (при создании заказа)
  async createWriteOff(productId: number, orderId: number, quantity: number, reason?: string) {
    const product = await this.productRepository.findByPk(productId);
    if (!product) {
      throw new HttpException('Товар не найден', HttpStatus.NOT_FOUND);
    }

    const currentStock = product.getDataValue('stock') || 0;
    if (currentStock < quantity) {
      throw new HttpException(
          `Недостаточно товара "${product.getDataValue('name')}". Доступно: ${currentStock}, требуется: ${quantity}`,
          HttpStatus.BAD_REQUEST
      );
    }

    // Создаем запись списания
    const writeOff = await this.writeOffRepository.create({
      id_product: productId,
      id_order: orderId,
      date: new Date(),
      quantity: quantity,
      reason: reason || `Продажа по заказу #${orderId}`,
    } as any);

    // Обновляем остаток
    await product.update({
      stock: currentStock - quantity
    });

    return writeOff.toJSON();
  }

  // Получить историю движений товара
  async getProductMovements(productId: number) {
    const product = await this.productRepository.findByPk(productId);
    if (!product) {
      throw new HttpException('Товар не найден', HttpStatus.NOT_FOUND);
    }

    const entrances = await this.entranceRepository.findAll({
      where: { id_product: productId },
      order: [['date', 'DESC']]
    });

    const writeOffs = await this.writeOffRepository.findAll({
      where: { id_product: productId },
      include: ['order'],
      order: [['date', 'DESC']]
    });

    // Объединяем и сортируем
    const movements = [
      ...entrances.map(e => ({
        type: 'приход',
        date: e.getDataValue('date'),
        quantity: e.getDataValue('quantity'),
        purchase_price: e.getDataValue('purchase_price'),
        details: `Поступление #${e.getDataValue('id_entrance')}`
      })),
      ...writeOffs.map(w => ({
        type: 'списание',
        date: w.getDataValue('date'),
        quantity: -w.getDataValue('quantity'),
        purchase_price: null,
        details: w.getDataValue('reason') || `Списание #${w.getDataValue('id_write_off')}`
      }))
    ];

    movements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return {
      product: product.toJSON(),
      currentStock: product.getDataValue('stock') || 0,
      movements
    };
  }

  async getEntrancesByProduct(id_product: number) {
    return this.entranceRepository.findAll({
      where: { id_product },
      include: ['product']
    });
  }

  async decreaseStock(productId: number, quantity: number = 1) {
    const product = await this.productRepository.findByPk(productId);
    if (!product) {
      throw new HttpException('Товар не найден', HttpStatus.NOT_FOUND);
    }
    if (product.getDataValue('stock') < quantity) {
      throw new HttpException('Недостаточно товара на складе', HttpStatus.BAD_REQUEST);
    }
    await product.update({
      stock: product.getDataValue('stock') - quantity
    });
    return product;
  }

  async addCharacteristics(dto: AddProductCharacteristicDto) {
    const product = await this.productRepository.findByPk(dto.id_product);
    if (!product) {
      throw new HttpException('Товар не найден', HttpStatus.NOT_FOUND);
    }

    if (!dto.characteristicValueIds || !Array.isArray(dto.characteristicValueIds)) {
      throw new HttpException('Не передан массив значений характеристик', HttpStatus.BAD_REQUEST);
    }

    for (const valueId of dto.characteristicValueIds) {
      const value = await this.characteristicsService.getCharacteristicValueById(valueId);
      if (!value) {
        throw new HttpException(
            `Значение характеристики с ID ${valueId} не найдено`,
            HttpStatus.NOT_FOUND
        );
      }
    }

    await this.productCharacteristicRepository.destroy({
      where: { id_product: dto.id_product }
    });

    for (const valueId of dto.characteristicValueIds) {
      await this.productCharacteristicRepository.create({
        id_product: dto.id_product,
        id_characters_value: valueId,
      } as any);
    }

    return this.getOne(dto.id_product);
  }

  async getProductCharacteristics(productId: number) {
    const product = await this.productRepository.findByPk(productId, {
      include: [
        {
          association: 'characteristicValues',
          include: ['characteristic']
        }
      ]
    });

    if (!product) {
      throw new HttpException('Товар не найден', HttpStatus.NOT_FOUND);
    }
    const characteristics = product.characteristicValues || [];
    return characteristics.map(cv => ({
      id: cv.id_characters_value,
      value: cv.value,
      description: cv.description,
      characteristic: cv.characteristic ? {
        id: cv.characteristic.id_characteristic,
        name: cv.characteristic.name,
        unit: cv.characteristic.unit,
        group: cv.characteristic.group
      } : null
    }));
  }
}