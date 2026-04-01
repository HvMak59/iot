import { Test, TestingModule } from '@nestjs/testing';
import { CurrentTelemetryPayloadController } from './current-telemetry-payload.controller';
import { CurrentTelemetryPayloadService } from './current-telemetry-payload.service';

describe('CurrentTelemetryController', () => {
  let controller: CurrentTelemetryPayloadController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CurrentTelemetryPayloadController],
      providers: [CurrentTelemetryPayloadService],
    }).compile();

    controller = module.get<CurrentTelemetryPayloadController>(CurrentTelemetryPayloadController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
