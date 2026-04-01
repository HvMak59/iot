import { Test, TestingModule } from '@nestjs/testing';
import { IotServerService } from './iot-server.service';

describe('IotServerService', () => {
  let service: IotServerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IotServerService],
    }).compile();

    service = module.get<IotServerService>(IotServerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
