import { Test, TestingModule } from '@nestjs/testing';
import { GameTimeService } from './game-time.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of } from 'rxjs';

describe('GameTimeService', () => {
  let service: GameTimeService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GameTimeService,
      {
        provide: ConfigService,
        useValue: {
          get: jest.fn()
        }
      },
      {
        provide: HttpService,
        useValue: {
          get: jest.fn(),
          post: jest.fn()
        }
      }
    ],
    }).compile();

    service = module.get<GameTimeService>(GameTimeService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // get game time
  it('should return game time for user', async() => {

    jest.spyOn(httpService, 'get').mockReturnValue(
      of({ data: { results: [{playtime: 43}]}}) as any
    );
    
    await expect(service.getGameTime('The Witcher 3')).resolves.toBe(43);
  });
});
