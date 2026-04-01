import { Test, TestingModule } from '@nestjs/testing';
import { DeviceModelAlertService } from './device-model-alert.service';

describe('DeviceModelAlertService', () => {
  let service: DeviceModelAlertService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DeviceModelAlertService],
    }).compile();

    service = module.get<DeviceModelAlertService>(DeviceModelAlertService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
