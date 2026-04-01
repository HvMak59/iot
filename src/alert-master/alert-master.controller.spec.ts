import { Test, TestingModule } from '@nestjs/testing';
import { AlertMasterController } from './alert-master.controller';
import { AlertMasterService } from './alert-master.service';

describe('AlertMasterController', () => {
  let controller: AlertMasterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AlertMasterController],
      providers: [AlertMasterService],
    }).compile();

    controller = module.get<AlertMasterController>(AlertMasterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
