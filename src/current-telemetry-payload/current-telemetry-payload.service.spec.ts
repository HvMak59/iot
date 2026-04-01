import { Test, TestingModule } from '@nestjs/testing';
import { CurrentTelemetryPayloadService } from './current-telemetry-payload.service';

describe('CurrentTelemetryPayloadService', () => {
  let service: CurrentTelemetryPayloadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CurrentTelemetryPayloadService],
    }).compile();

    service = module.get<CurrentTelemetryPayloadService>(CurrentTelemetryPayloadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
