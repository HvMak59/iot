import { Test, TestingModule } from '@nestjs/testing';
import { AuditDateTimeController } from './audit_attribute.controller';
import { AuditDateTimeService } from './audit_attribute.service';

describe('AuditDateTimeController', () => {
  let controller: AuditDateTimeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuditDateTimeController],
      providers: [AuditDateTimeService],
    }).compile();

    controller = module.get<AuditDateTimeController>(AuditDateTimeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
