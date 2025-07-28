import { Test, TestingModule } from '@nestjs/testing';
import { GamesServiceService } from './games-service.service';

describe('GamesServiceService', () => {
  let service: GamesServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GamesServiceService],
    }).compile();

    service = module.get<GamesServiceService>(GamesServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
