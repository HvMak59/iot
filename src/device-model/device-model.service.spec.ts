import { Test, TestingModule } from '@nestjs/testing';
import { DeviceModelService } from './device-model.service';

describe('DeviceModelService', () => {
  let service: DeviceModelService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DeviceModelService],
    }).compile();

    service = module.get<DeviceModelService>(DeviceModelService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
