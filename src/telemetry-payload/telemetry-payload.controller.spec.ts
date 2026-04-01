import { Test, TestingModule } from '@nestjs/testing';
import { TelemetryPayloadController } from './telemetry-payload.controller';
import { TelemetryPayloadService } from './telemetry-payload.service';

describe('TelemetryPayloadController', () => {
  let controller: TelemetryPayloadController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TelemetryPayloadController],
      providers: [TelemetryPayloadService],
    }).compile();

    controller = module.get<TelemetryPayloadController>(TelemetryPayloadController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
