import { Test, TestingModule } from '@nestjs/testing';
import { DeviceManufacturerService } from './device-manufacturer.service';

describe('DeviceManufacturerService', () => {
  let service: DeviceManufacturerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DeviceManufacturerService],
    }).compile();

    service = module.get<DeviceManufacturerService>(DeviceManufacturerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
