import { Test, TestingModule } from '@nestjs/testing';
import { IotServerController } from './iot-server.controller';
import { IotServerService } from './iot-server.service';

describe('IotServerController', () => {
  let controller: IotServerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IotServerController],
      providers: [IotServerService],
    }).compile();

    controller = module.get<IotServerController>(IotServerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
