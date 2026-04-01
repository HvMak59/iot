import { Test, TestingModule } from '@nestjs/testing';
import { DeviceModelAlertController } from './device-model-alert.controller';
import { DeviceModelAlertService } from './device-model-alert.service';

describe('DeviceModelAlertController', () => {
  let controller: DeviceModelAlertController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeviceModelAlertController],
      providers: [DeviceModelAlertService],
    }).compile();

    controller = module.get<DeviceModelAlertController>(DeviceModelAlertController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
