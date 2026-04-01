import { Test, TestingModule } from '@nestjs/testing';
import { AlertMasterIdentifierService } from './alert-master-identifier.service';

describe('AlertMasterIdentifierService', () => {
  let service: AlertMasterIdentifierService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AlertMasterIdentifierService],
    }).compile();

    service = module.get<AlertMasterIdentifierService>(AlertMasterIdentifierService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
