import { Test, TestingModule } from '@nestjs/testing';
import { AuditDateTimeService } from './audit_attribute.service';

describe('AuditDateTimeService', () => {
  let service: AuditDateTimeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuditDateTimeService],
    }).compile();

    service = module.get<AuditDateTimeService>(AuditDateTimeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
