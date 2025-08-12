import { Test, TestingModule } from '@nestjs/testing';
import { WorkerService } from './worker.service';
import { HttpService } from '@nestjs/axios';
import GameDetailsResponse, { GameDetails } from './interfaces/game-details.interface';

describe('WorkerService', () => {
  let service: WorkerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkerService, {
        provide: HttpService,
        useValue: {
          get: jest.fn()
        }
      }],
    }).compile();

    service = module.get<WorkerService>(WorkerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get game details', async() => {
    const appid = 418370;
    const expectedGame: Partial<GameDetails> = { name: 'Test Game', genres: [{id: 1, description: 'Action'}, {id: 2, description: 'RPG'}]};

    jest.spyOn(service, 'getGameDetails').mockResolvedValueOnce(expectedGame as GameDetailsResponse);

    const result = await service.getGameDetails(appid);
    expect(service.getGameDetails).toHaveBeenCalledWith(appid);
    expect(result).toMatchObject(expectedGame);
  });
});
