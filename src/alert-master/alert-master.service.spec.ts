import { Test, TestingModule } from '@nestjs/testing';
import { AlertMasterService } from './alert-master.service';

describe('AlertMasterService', () => {
  let service: AlertMasterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AlertMasterService],
    }).compile();

    service = module.get<AlertMasterService>(AlertMasterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
