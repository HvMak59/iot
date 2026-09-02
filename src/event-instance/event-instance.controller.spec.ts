import { Test, TestingModule } from '@nestjs/testing';
import { EventInstanceController } from './event-instance.controller';
import { EventInstanceService } from './event-instance.service';

describe('EventInstanceController', () => {
  let controller: EventInstanceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventInstanceController],
      providers: [EventInstanceService],
    }).compile();

    controller = module.get<EventInstanceController>(EventInstanceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
