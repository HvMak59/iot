import { Test, TestingModule } from '@nestjs/testing';
import { AlertMasterIdentifierController } from './alert-master-identifier.controller';
import { AlertMasterIdentifierService } from './alert-master-identifier.service';

describe('AlertMasterIdentifierController', () => {
  let controller: AlertMasterIdentifierController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AlertMasterIdentifierController],
      providers: [AlertMasterIdentifierService],
    }).compile();

    controller = module.get<AlertMasterIdentifierController>(AlertMasterIdentifierController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
