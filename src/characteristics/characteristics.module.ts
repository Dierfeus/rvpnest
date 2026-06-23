import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Characteristic } from './characteristics.model';
import { CharacteristicValue } from './characteristic-value.model';
import { CharacteristicsService } from './characteristics.service';
import { CharacteristicsController } from './characteristics.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Characteristic, CharacteristicValue]),
    AuthModule,
  ],
  providers: [CharacteristicsService],
  controllers: [CharacteristicsController],
  exports: [CharacteristicsService],
})
export class CharacteristicsModule {}