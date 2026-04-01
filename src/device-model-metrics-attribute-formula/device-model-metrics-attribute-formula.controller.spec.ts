import { Test, TestingModule } from '@nestjs/testing';
import { DeviceModelMetricsAttributeFormulaController } from './device-model-metrics-attribute-formula.controller';
import { DeviceModelMetricsAttributeFormulaService } from './device-model-metrics-attribute-formula.service';

describe('DeviceModelMetricsAttributeFormulaController', () => {
  let controller: DeviceModelMetricsAttributeFormulaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeviceModelMetricsAttributeFormulaController],
      providers: [DeviceModelMetricsAttributeFormulaService],
    }).compile();

    controller = module.get<DeviceModelMetricsAttributeFormulaController>(
      DeviceModelMetricsAttributeFormulaController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
