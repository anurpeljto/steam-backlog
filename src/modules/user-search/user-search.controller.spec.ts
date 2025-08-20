import { Test, TestingModule } from '@nestjs/testing';
import { UserSearchController } from './user-search.controller';
import { GamesServiceService } from 'src/modules/games-service/games-service.service';

const mockGame = {
  total: 1,
  totalPages: 1,
  games: [
    {
      name: 'Game 1',
      rating: 5,
      expanded: false
    }
  ]
}

describe('UserSearchController', () => {
  let controller: UserSearchController;
  let gamesService: GamesServiceService;
  
  const mockGamesService = {
    fetchAndStoreUserGames: jest.fn().mockResolvedValue(['mock-game']),
    getUserGamesWithMetadata: jest.fn().mockResolvedValue(mockGame),
    getUserGamesGenres: jest.fn().mockResolvedValue([{Action: 10}, {RPG: 20}]),
    getRecommendedGames: jest.fn().mockResolvedValue([mockGame]),
    searchGames: jest.fn().mockResolvedValue([mockGame]),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserSearchController],
      providers: [
        {
          provide: GamesServiceService,
          useValue: mockGamesService
        }
      ]
    }).compile();

    controller = module.get<UserSearchController>(UserSearchController);
    gamesService = module.get<GamesServiceService>(GamesServiceService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call fetchAndStoreUserGames with steamid', async() => {
    mockGamesService.fetchAndStoreUserGames.mockResolvedValue(['mock-game']);

    const steamid = '123456789';
    const result = await controller.getUserGames(steamid);

    expect(mockGamesService.fetchAndStoreUserGames).toHaveBeenCalledWith(steamid);
    expect(result).toStrictEqual(['mock-game']);
  });

  it('should get user data from database with pagination etc', async() => {
    mockGamesService.getUserGamesWithMetadata.mockResolvedValue(mockGame);

    const steamid = '123456789';
    const result = await controller.getUserGamesFromDb(steamid, 0, 10, '', '', '');

    expect(mockGamesService.getUserGamesWithMetadata).toHaveBeenCalledWith(steamid, 0, 10, '', '', '');
    expect(result).toStrictEqual(mockGame)
  });

  it('should return genres and call getUserGamesGenres', async() => {
    const steamid = '123456789'
    const result = await controller.getUserGamesGenres(steamid);

    expect(mockGamesService.getUserGamesGenres).toHaveBeenCalledWith(steamid);
    expect(mockGamesService.getUserGamesGenres).toHaveBeenCalledTimes(1);
    expect(result).toStrictEqual([
      {'Action': 10},
      {'RPG': 20}
    ])
  });

  // get recommended games
  it('should call getRecommendedGames', async() => {
    const steamid = '123456789';
    const result = await controller.getRecommendedGames(steamid);

    expect(result).toStrictEqual([mockGame]);
    expect(mockGamesService.getRecommendedGames).toHaveBeenCalledTimes(1);
  });

  // call search games
  it('should call search games and return games', async() => {
    const games = await controller.searchGames('The Witcher 3', '123456789', 0, 10);
    expect(games).toStrictEqual([mockGame]);
    expect(mockGamesService.searchGames).toHaveBeenCalledTimes(1);
  });
});
