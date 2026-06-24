import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Product } from './products.model';
import { Entrance } from './entrance.model';
import { WriteOff } from './write-off.model';
import { ProductCharacteristic } from './product-characteristic.model';
import { Sequelize } from 'sequelize-typescript';
import { Transaction } from 'sequelize';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AddProductCharacteristicDto } from './dto/add-product-characteristic.dto';
import { CreateEntranceDto } from './dto/create-entrance.dto';

@Injectable()
export class ProductsService {
  constructor(
      @InjectModel(Product) private productRepository: typeof Product,
      @InjectModel(Entrance) private entranceRepository: typeof Entrance,
      @InjectModel(WriteOff) private writeOffRepository: typeof WriteOff,
      @InjectModel(ProductCharacteristic) private productCharacteristicRepository: typeof ProductCharacteristic,
      private sequelize: Sequelize,
  ) {}

  async getProductStock(productId: number): Promise<number> {
    if (!productId) {
      return 0;
    }

    const totalEntrance = await this.entranceRepository.sum('quantity', {
      where: { id_product: productId }
    });

    const totalWriteOff = await this.writeOffRepository.sum('quantity', {
      where: { id_product: productId }
    });

    const stock = (totalEntrance || 0) - (totalWriteOff || 0);
    return Math.max(0, stock);
  }

  async checkMultipleStock(items: { productId: number; quantity: number }[]) {
    const results: any[] = [];
    let allAvailable = true;

    for (const item of items) {
      const currentStock = await this.getProductStock(item.productId);
      const available = currentStock >= item.quantity;

      results.push({
        productId: item.productId,
        currentStock,
        required: item.quantity,
        available,
      });

      if (!available) allAvailable = false;
    }

    return {
      available: allAvailable,
      details: results,
    };
  }

  async decreaseStockWithLock(
      productId: number,
      quantity: number,
      orderId: number,
      transaction: Transaction,
  ) {
    const currentStock = await this.getProductStock(productId);

    if (currentStock < quantity) {
      throw new HttpException(
          `Недостаточно товара на складе. Доступно: ${currentStock}, требуется: ${quantity}`,
          HttpStatus.BAD_REQUEST,
      );
    }

    await this.writeOffRepository.create(
        {
          id_product: productId,
          id_order: orderId,
          date: new Date(),
          quantity: quantity,
          reason: `Продажа по заказу #${orderId}`,
        } as any,
        { transaction },
    );

    return { productId, newStock: currentStock - quantity };
  }

  async restoreStockFromOrder(orderId: number, transaction: Transaction) {
    const writeOffs = await this.writeOffRepository.findAll({
      where: { id_order: orderId },
      transaction,
    });

    for (const writeOff of writeOffs) {
      await writeOff.destroy({ transaction });
    }

    return { restored: writeOffs.length };
  }

  async addEntrance(
      productId: number,
      quantity: number,
      purchasePrice: number,
      transaction?: Transaction,
  ) {
    const product = await this.productRepository.findByPk(productId);
    if (!product) {
      throw new HttpException('Товар не найден', HttpStatus.NOT_FOUND);
    }

    const entrance = await this.entranceRepository.create(
        {
          id_product: productId,
          date: new Date(),
          purchase_price: purchasePrice,
          quantity: quantity,
        } as any,
        { transaction },
    );

    return entrance;
  }

  async createEntrance(dto: CreateEntranceDto) {
    const product = await this.productRepository.findByPk(dto.id_product);
    if (!product) {
      throw new HttpException('Товар не найден', HttpStatus.NOT_FOUND);
    }

    const entrance = await this.entranceRepository.create({
      id_product: dto.id_product,
      date: new Date(dto.date),
      purchase_price: dto.purchase_price,
      quantity: dto.quantity || 1,
    } as any);

    return entrance;
  }

  async getEntrancesByProduct(productId: number) {
    return this.entranceRepository.findAll({
      where: { id_product: productId },
      order: [['date', 'DESC']],
    });
  }

  async createProduct(dto: CreateProductDto) {
    const product = await this.productRepository.create(dto as any);
    return product;
  }

  async getAllProducts() {
    const products = await this.productRepository.findAll({
      include: ['category', 'user'],
    });

    const result: any[] = [];
    for (const product of products) {
      const stock = await this.getProductStock(product.id_product);
      const productData = product.toJSON();
      result.push({
        ...productData,
        stock,
      });
    }

    return result;
  }

  async getOne(id: number) {
    const product = await this.productRepository.findByPk(id, {
      include: ['category', 'user'],
    });

    if (!product) {
      throw new HttpException('Товар не найден', HttpStatus.NOT_FOUND);
    }

    const stock = await this.getProductStock(id);
    const productData = product.toJSON();

    return {
      ...productData,
      stock,
    };
  }

  async updateProduct(id: number, dto: UpdateProductDto) {
    const product = await this.productRepository.findByPk(id);

    if (!product) {
      throw new HttpException('Товар не найден', HttpStatus.NOT_FOUND);
    }

    await product.update(dto);
    return this.getOne(id);
  }

  async deleteProduct(id: number) {
    const product = await this.productRepository.findByPk(id);

    if (!product) {
      throw new HttpException('Товар не найден', HttpStatus.NOT_FOUND);
    }

    await product.destroy();
    return { message: 'Товар удален' };
  }

  async getProductsByCategory(categoryId: number) {
    const products = await this.productRepository.findAll({
      where: { id_category: categoryId },
      include: ['category', 'user'],
    });

    const result: any[] = [];
    for (const product of products) {
      const stock = await this.getProductStock(product.id_product);
      const productData = product.toJSON();
      result.push({
        ...productData,
        stock,
      });
    }

    return result;
  }

  async getProductsByUser(userId: number) {
    const products = await this.productRepository.findAll({
      where: { id_user: userId },
      include: ['category', 'user'],
    });

    const result: any[] = [];
    for (const product of products) {
      const stock = await this.getProductStock(product.id_product);
      const productData = product.toJSON();
      result.push({
        ...productData,
        stock,
      });
    }

    return result;
  }

  async getProductWithStock(id: number) {
    const product = await this.productRepository.findByPk(id);

    if (!product) {
      throw new HttpException('Товар не найден', HttpStatus.NOT_FOUND);
    }

    const stock = await this.getProductStock(id);
    const productData = product.toJSON();

    return {
      ...productData,
      stock,
    };
  }

  async getMultipleProductsWithStock(ids: number[]) {
    const products = await this.productRepository.findAll({
      where: { id_product: ids },
      include: ['category', 'user'],
    });

    const result: any[] = [];
    for (const product of products) {
      const stock = await this.getProductStock(product.id_product);
      const productData = product.toJSON();
      result.push({
        ...productData,
        stock,
      });
    }

    return result;
  }

  async getEntranceHistory(productId: number) {
    return this.entranceRepository.findAll({
      where: { id_product: productId },
      order: [['date', 'DESC']],
    });
  }

  async getWriteOffHistory(productId: number) {
    return this.writeOffRepository.findAll({
      where: { id_product: productId },
      include: ['order'],
      order: [['date', 'DESC']],
    });
  }

  async getProductMovement(productId: number) {
    const entrances = await this.getEntranceHistory(productId);
    const writeOffs = await this.getWriteOffHistory(productId);

    return {
      entrances,
      writeOffs,
      currentStock: await this.getProductStock(productId),
    };
  }

  async getProductMovements(productId: number) {
    return this.getProductMovement(productId);
  }

  async getProductCharacteristics(productId: number) {
    const characteristics = await this.productCharacteristicRepository.findAll({
      where: { id_product: productId },
      include: ['characteristicValue'],
    });
    return characteristics;
  }

  async addCharacteristics(dto: AddProductCharacteristicDto) {
    const product = await this.productRepository.findByPk(dto.id_product);
    if (!product) {
      throw new HttpException('Товар не найден', HttpStatus.NOT_FOUND);
    }

    const results: any[] = [];
    for (const valueId of dto.characteristicValueIds) {
      const pc = await this.productCharacteristicRepository.create({
        id_product: dto.id_product,
        id_characters_value: valueId,
      } as any);
      results.push(pc);
    }

    return results;
  }

  async getProductPrice(productId: number) {
    const product = await this.productRepository.findByPk(productId);
    if (!product) {
      throw new HttpException('Товар не найден', HttpStatus.NOT_FOUND);
    }
    return { price: product.price };
  }

  async getAll(options: {
    categoryId?: number;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    let products = await this.getAllProducts();

    if (options.categoryId) {
      products = products.filter(p => p.id_category === options.categoryId);
    }

    if (options.minPrice !== undefined && options.minPrice !== null) {
      products = products.filter(p => Number(p.price) >= (options.minPrice || 0));
    }

    if (options.maxPrice !== undefined && options.maxPrice !== null) {
      products = products.filter(p => Number(p.price) <= (options.maxPrice || Infinity));
    }

    if (options.search) {
      const searchLower = options.search.toLowerCase();
      products = products.filter(p =>
          p.name.toLowerCase().includes(searchLower) ||
          (p.description && p.description.toLowerCase().includes(searchLower))
      );
    }

    const start = Number(options.offset) || 0;
    const end = start + Number(options.limit) || 20;

    return {
      items: products.slice(start, end),
      total: products.length,
    };
  }

  async create(dto: CreateProductDto) {
    return this.createProduct(dto);
  }

  async update(id: number, dto: UpdateProductDto) {
    return this.updateProduct(id, dto);
  }

  async delete(id: number) {
    return this.deleteProduct(id);
  }
}