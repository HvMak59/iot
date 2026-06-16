import { Test, TestingModule } from '@nestjs/testing';
import { DeviceTypeMetricsAttributeService } from './device-type-metrics-attribute.service';

describe('DeviceTypeMetricsAttributeService', () => {
  let service: DeviceTypeMetricsAttributeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DeviceTypeMetricsAttributeService],
    }).compile();

    service = module.get<DeviceTypeMetricsAttributeService>(
      DeviceTypeMetricsAttributeService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
