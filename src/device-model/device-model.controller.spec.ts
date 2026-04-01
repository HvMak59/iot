import { Test, TestingModule } from '@nestjs/testing';
import { DeviceModelController } from './device-model.controller';
import { DeviceModelService } from './device-model.service';

describe('DeviceModelController', () => {
  let controller: DeviceModelController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeviceModelController],
      providers: [DeviceModelService],
    }).compile();

    controller = module.get<DeviceModelController>(DeviceModelController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
