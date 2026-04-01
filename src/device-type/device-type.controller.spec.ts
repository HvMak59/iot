import { Test, TestingModule } from '@nestjs/testing';
import { DeviceTypeController } from './device-type.controller';
import { DeviceTypeService } from './device-type.service';

describe('DeviceTypeController', () => {
  let controller: DeviceTypeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeviceTypeController],
      providers: [DeviceTypeService],
    }).compile();

    controller = module.get<DeviceTypeController>(DeviceTypeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
