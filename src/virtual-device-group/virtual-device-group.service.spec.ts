import { Test, TestingModule } from '@nestjs/testing';
import { VirtualDeviceGroupService } from './virtual-device-group.service';

describe('VirtualDeviceGroupService', () => {
  let service: VirtualDeviceGroupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VirtualDeviceGroupService],
    }).compile();

    service = module.get<VirtualDeviceGroupService>(VirtualDeviceGroupService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
