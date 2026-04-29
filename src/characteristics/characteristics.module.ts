import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Characteristic } from './characteristics.model';
import { CharacteristicValue } from './characteristic-value.model';
import { CharacteristicsService } from './characteristics.service';
import { CharacteristicsController } from './characteristics.controller';

@Module({
  imports: [SequelizeModule.forFeature([Characteristic, CharacteristicValue])],
  providers: [CharacteristicsService],
  controllers: [CharacteristicsController],
  exports: [CharacteristicsService],
})
export class CharacteristicsModule {}