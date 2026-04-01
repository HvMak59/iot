import { Module } from '@nestjs/common';
import { MetricsAttributeFormulaService } from './metrics-attribute-formula.service';
import { MetricsAttributeFormulaController } from './metrics-attribute-formula.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MetricsAttributeFormula } from './entities/metrics-attribute-formula.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MetricsAttributeFormula])],
  controllers: [MetricsAttributeFormulaController],
  providers: [MetricsAttributeFormulaService],
  exports: [MetricsAttributeFormulaService],
})
export class MetricsAttributeFormulaModule {}
