import { Test, TestingModule } from '@nestjs/testing';
import { GameStatusController } from './game-status.controller';

describe('GameStatusController', () => {
  let controller: GameStatusController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GameStatusController],
    }).compile();

    controller = module.get<GameStatusController>(GameStatusController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
