import { Test, TestingModule } from '@nestjs/testing';
import { EventInstanceService } from './event-instance.service';

describe('EventInstanceService', () => {
  let service: EventInstanceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventInstanceService],
    }).compile();

    service = module.get<EventInstanceService>(EventInstanceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
