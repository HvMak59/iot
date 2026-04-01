import { Test, TestingModule } from '@nestjs/testing';
import { CurrentOpenAlertController } from './current-open-alert.controller';
import { CurrentOpenAlertService } from './current-open-alert.service';

describe('CurrentOpenAlertController', () => {
  let controller: CurrentOpenAlertController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CurrentOpenAlertController],
      providers: [CurrentOpenAlertService],
    }).compile();

    controller = module.get<CurrentOpenAlertController>(CurrentOpenAlertController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
