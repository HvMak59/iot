import { Test, TestingModule } from '@nestjs/testing';
import { DeviceModelMetricsAttributeFormulaService } from './device-model-metrics-attribute-formula.service';

describe('DeviceModelMetricsAttributeFormulaService', () => {
  let service: DeviceModelMetricsAttributeFormulaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DeviceModelMetricsAttributeFormulaService],
    }).compile();

    service = module.get<DeviceModelMetricsAttributeFormulaService>(
      DeviceModelMetricsAttributeFormulaService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
