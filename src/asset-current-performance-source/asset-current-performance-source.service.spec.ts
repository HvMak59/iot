import { Test, TestingModule } from '@nestjs/testing';
import { AssetCurrentPerformanceSourceService } from './asset-current-performance-source.service';

describe('AssetCurrentPerformanceSourceService', () => {
  let service: AssetCurrentPerformanceSourceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AssetCurrentPerformanceSourceService],
    }).compile();

    service = module.get<AssetCurrentPerformanceSourceService>(AssetCurrentPerformanceSourceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
