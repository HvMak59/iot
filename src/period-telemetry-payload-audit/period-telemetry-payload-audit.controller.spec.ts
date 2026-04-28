import { Test, TestingModule } from '@nestjs/testing';
import { PeriodTelemetryPayloadAuditController } from './period-telemetry-payload-audit.controller';
import { PeriodTelemetryPayloadAuditService } from './period-telemetry-payload-audit.service';
import { describe, beforeEach, it } from 'node:test';
import { expect } from '@jest/globals';

describe('PeriodTelemetryPayloadAuditController', () => {
  let controller: PeriodTelemetryPayloadAuditController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PeriodTelemetryPayloadAuditController],
      providers: [PeriodTelemetryPayloadAuditService],
    }).compile();

    controller = module.get<PeriodTelemetryPayloadAuditController>(
      PeriodTelemetryPayloadAuditController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
