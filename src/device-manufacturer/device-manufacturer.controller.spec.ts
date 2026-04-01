import { Test, TestingModule } from '@nestjs/testing';
import { DeviceManufacturerController } from './device-manufacturer.controller';
import { DeviceManufacturerService } from './device-manufacturer.service';

describe('DeviceManufacturerController', () => {
  let controller: DeviceManufacturerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeviceManufacturerController],
      providers: [DeviceManufacturerService],
    }).compile();

    controller = module.get<DeviceManufacturerController>(DeviceManufacturerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
