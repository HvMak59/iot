import { Test, TestingModule } from '@nestjs/testing';
import { PeriodTelemetryPayloadAuditService } from './period-telemetry-payload-audit.service';

describe('PeriodTelemetryPayloadAuditService', () => {
  let service: PeriodTelemetryPayloadAuditService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PeriodTelemetryPayloadAuditService],
    }).compile();

    service = module.get<PeriodTelemetryPayloadAuditService>(PeriodTelemetryPayloadAuditService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
