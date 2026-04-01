import { Test, TestingModule } from '@nestjs/testing';
import { CurrentOpenAlertService } from './current-open-alert.service';

describe('CurrentOpenAlertService', () => {
  let service: CurrentOpenAlertService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CurrentOpenAlertService],
    }).compile();

    service = module.get<CurrentOpenAlertService>(CurrentOpenAlertService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
