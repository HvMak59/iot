import { Test, TestingModule } from '@nestjs/testing';
import { DeviceTypeMetricsAttributeController } from './device-type-metrics-attribute.controller';
import { DeviceTypeMetricsAttributeService } from './device-type-metrics-attribute.service';

describe('DeviceTypeMetricsAttributeController', () => {
  let controller: DeviceTypeMetricsAttributeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeviceTypeMetricsAttributeController],
      providers: [DeviceTypeMetricsAttributeService],
    }).compile();

    controller = module.get<DeviceTypeMetricsAttributeController>(
      DeviceTypeMetricsAttributeController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
