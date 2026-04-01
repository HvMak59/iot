import { Module } from '@nestjs/common';
import { MetricsAttributeService } from './metrics-attribute.service';
import { MetricsAttributeController } from './metrics-attribute.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MetricsAttribute } from './entities/metrics-attribute.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MetricsAttribute])],
  exports: [MetricsAttributeService],
  controllers: [MetricsAttributeController],
  providers: [MetricsAttributeService],
})
export class MetricsAttributeModule {}
