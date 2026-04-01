import { Test, TestingModule } from '@nestjs/testing';
import { TelemetryPayloadService } from './telemetry-payload.service';

describe('TelemetryPayloadService', () => {
  let service: TelemetryPayloadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TelemetryPayloadService],
    }).compile();

    service = module.get<TelemetryPayloadService>(TelemetryPayloadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
