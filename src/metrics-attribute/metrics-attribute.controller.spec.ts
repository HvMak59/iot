import { Test, TestingModule } from '@nestjs/testing';
import { MetricsAttributeController } from './metrics-attribute.controller';
import { MetricsAttributeService } from './metrics-attribute.service';

describe('MetricsAttributeController', () => {
  let controller: MetricsAttributeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MetricsAttributeController],
      providers: [MetricsAttributeService],
    }).compile();

    controller = module.get<MetricsAttributeController>(
      MetricsAttributeController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
