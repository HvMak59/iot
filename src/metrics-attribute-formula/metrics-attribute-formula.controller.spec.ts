import { Test, TestingModule } from '@nestjs/testing';
import { MetricsAttributeFormulaController } from './metrics-attribute-formula.controller';
import { MetricsAttributeFormulaService } from './metrics-attribute-formula.service';

describe('MetricsAttributeFormulaController', () => {
  let controller: MetricsAttributeFormulaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MetricsAttributeFormulaController],
      providers: [MetricsAttributeFormulaService],
    }).compile();

    controller = module.get<MetricsAttributeFormulaController>(
      MetricsAttributeFormulaController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
