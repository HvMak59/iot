import { Test, TestingModule } from '@nestjs/testing';
import { AssetCurrentPerformanceSourceController } from './asset-current-performance-source.controller';
import { AssetCurrentPerformanceSourceService } from './asset-current-performance-source.service';

describe('AssetCurrentPerformanceSourceController', () => {
  let controller: AssetCurrentPerformanceSourceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssetCurrentPerformanceSourceController],
      providers: [AssetCurrentPerformanceSourceService],
    }).compile();

    controller = module.get<AssetCurrentPerformanceSourceController>(AssetCurrentPerformanceSourceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
