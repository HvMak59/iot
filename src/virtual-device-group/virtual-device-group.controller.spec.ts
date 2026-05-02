import { Test, TestingModule } from '@nestjs/testing';
import { VirtualDeviceGroupController } from './virtual-device-group.controller';
import { VirtualDeviceGroupService } from './virtual-device-group.service';

describe('VirtualDeviceGroupController', () => {
  let controller: VirtualDeviceGroupController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VirtualDeviceGroupController],
      providers: [VirtualDeviceGroupService],
    }).compile();

    controller = module.get<VirtualDeviceGroupController>(VirtualDeviceGroupController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
