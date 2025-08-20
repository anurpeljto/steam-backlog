import { Test, TestingModule } from '@nestjs/testing';
import { GamesServiceService } from './games-service.service';
import { Repository } from 'typeorm';
import { Badge } from 'src/entities/badge.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OwnedGame } from 'src/entities/ownedgame.entity';
import { User } from 'src/entities/user.entity';
import { GameMetadata } from 'src/entities/game_metadata.entity';
import { HttpService } from '@nestjs/axios';
import { MetadataQueue } from 'src/worker/metadata.queue';
import { ConfigService } from '@nestjs/config';

const testSteamId = '123456789';
const mockGames = [
        {
          appid: 1,
          name: 'Game A',
          genres: ['Action', 'RPG'],
          iscompleted: false,
          expanded: false,
          rating: 4.5
        },
        {
          appid: 2,
          name: 'Game B',
          genres: ['Action'],
          iscompleted: false,
          expanded: false,
          rating: 3
        },
        {
          appid: 3,
          name: 'Game C',
          genres: ['Puzzle'],
          iscompleted: true,
          expanded: false,
          rating: 5
        }
];

describe('GamesServiceService', () => {
  let service: GamesServiceService;
  let ownedRepo: jest.Mocked<Repository<OwnedGame>>;
  let usersRepo: jest.Mocked<Repository<User>>;
  let gameMetadata: jest.Mocked<Repository<GameMetadata>>;
  let metadataQueue: MetadataQueue;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GamesServiceService,
        {
          provide: getRepositoryToken(OwnedGame),
          useValue: {
            save: jest.fn(),
            create: jest.fn(),
            insert: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            upsert: jest.fn(),
            createQueryBuilder: jest.fn()
          }
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            save: jest.fn(),
            create: jest.fn(),
            insert: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn()
          }
        },
        {
          provide: getRepositoryToken(GameMetadata),
          useValue: {
            save: jest.fn(),
            create: jest.fn(),
            insert: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            findBy: jest.fn()
          }
        },
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
            post: jest.fn()
          }
        },
        {
          provide: MetadataQueue,
          useValue: {
            addFetchJob: jest.fn()
          }
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn()
          }
        }
      ],
    }).compile();

    service = module.get<GamesServiceService>(GamesServiceService);
    ownedRepo = module.get(getRepositoryToken(OwnedGame));
    gameMetadata = module.get(getRepositoryToken(GameMetadata));
    usersRepo = module.get(getRepositoryToken(User));
    metadataQueue = module.get(MetadataQueue);
  });

    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should throw error when user has no games', async () => {
      jest.spyOn(usersRepo, 'findOne').mockResolvedValue(null);
      jest.spyOn(usersRepo, 'create').mockReturnValue({ id: 123, steam_id: testSteamId } as User);
      jest.spyOn(usersRepo, 'save').mockResolvedValue({ id: 123, steam_id: testSteamId } as User);

      jest.spyOn(service['http'], 'get').mockReturnValue({
        toPromise: jest.fn(),
      } as any);

      jest.spyOn(require('rxjs'), 'firstValueFrom').mockResolvedValue({
        data: {
          response: {
            games: []
          }
        }
      });

      await expect(service.fetchAndStoreUserGames(testSteamId)).rejects.toThrow('User has no existing metadata');
  });

  // create user if missing on fetch & store
  it('should create user if missing on fetch & store user games', async() => {
    jest.spyOn(usersRepo, 'findOne').mockResolvedValue(null);
    jest.spyOn(usersRepo, 'create').mockReturnValue({ id: 123, steam_id: testSteamId } as User);
    jest.spyOn(usersRepo, 'save').mockResolvedValue({ id: 123, steam_id: testSteamId } as User);
    jest.spyOn(service['http'], 'get').mockReturnValue({
      toPromise: jest.fn(),
    } as any);

    const fakeGame = {
      appid: 1,
      playtime_forever: 100,
      rtime_last_played: 1234567890,
    };

    jest.spyOn(require('rxjs'), 'firstValueFrom').mockResolvedValue({
      data: {
        response: {
          games: [fakeGame]
        }
      }
    });

    jest.spyOn(ownedRepo, 'upsert').mockResolvedValue({} as any);
    jest.spyOn(gameMetadata, 'findBy').mockResolvedValue([]);
    jest.spyOn(metadataQueue, 'addFetchJob').mockResolvedValue(undefined);

    const result = await service.fetchAndStoreUserGames(testSteamId);
    expect(usersRepo.create).toHaveBeenCalledWith({ steam_id: testSteamId});
    expect(usersRepo.save).toHaveBeenCalledTimes(1);
    expect(ownedRepo.upsert).toHaveBeenCalled();
    expect(metadataQueue.addFetchJob).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      appid: fakeGame.appid,
      playtime_minutes: fakeGame.playtime_forever,
      loadingMetadata: true,
      expanded: false,
    });
  });

  // fetch user's games with metadata
  it('should fetch user games with metadata', async() => {
    jest.spyOn(usersRepo, 'findOne').mockResolvedValue({
      id: 4,
      created_at: new Date(),
      steam_id: testSteamId,
      username: 'test',
      updated_at: new Date(),
      owned_games: []
    });

    const mockQueryBuilder = {
      leftJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(2),
      getRawMany: jest.fn().mockResolvedValue([
        {
          appid: 1,
          playtime_minutes: 100,
          last_played: new Date(),
          name: 'Game 1',
          header_image: 'image1.png',
          genres: ['Action'],
          categories: ['Multiplayer'],
          main_story: 10,
          hltb_100_percent: 20,
          isCompleted: false,
          rating: 4.5
        },
        {
          appid: 2,
          playtime_minutes: 50,
          last_played: new Date(),
          name: 'Game 2',
          header_image: 'image2.png',
          genres: ['RPG'],
          categories: ['Singleplayer'],
          main_story: 15,
          hltb_100_percent: 30,
          isCompleted: true,
          rating: 4.0
        }
      ]),
    };

    jest.spyOn(ownedRepo, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

    const result = await service.getUserGamesWithMetadata(testSteamId, 0, 10, undefined, undefined, undefined);

    expect(result.total).toBe(2);
    expect(result.totalPages).toBe(1);
    expect(result.games).toHaveLength(2);
    expect(result.games[0]).toMatchObject({
      appid: 1,
      name: 'Game 1',
      expanded: false
    });
    expect(result.games[1].expanded).toBe(false);
  });

  // test userGamesGenres
  it('should return user games genres', async() => {
    const mockQueryBuilder = {
      leftJoin: jest.fn().mockReturnThis(),
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(2),
      getRawMany: jest.fn().mockResolvedValue([
        { genre: 'Action' },
        { genre: 'RPG' },
        { genre: 'Singleplayer' },
        { genre: 'Violent' }
      ]),
    };

    jest.spyOn(ownedRepo, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

    const result = await service.getUserGamesGenres(testSteamId);

    expect(ownedRepo.createQueryBuilder).toHaveBeenCalledTimes(1);
    expect(result.genres).toEqual([{genre: 'Action'}, {genre: 'RPG'}, {genre: 'Singleplayer'}, {genre: 'Violent'}]);
  });

  // get recommended games for user
  it('should return recommended ranked games for user', async() => {
      jest.spyOn(service, 'getUserGamesWithMetadata').mockResolvedValue({
        total: 3,
        totalPages: 1,
        games: mockGames
      });

      const result = await service.getRecommendedGames(testSteamId, '2');
      
      expect(result).toHaveLength(2);
      expect(service.getUserGamesWithMetadata).toHaveBeenCalledTimes(1);
      expect(result[0].combinedScore).toBeGreaterThanOrEqual(result[1].combinedScore);
      expect(result.every(g => g.isCompleted !== true)).toBe(true);
      expect(result.map(g => g.appid)).toEqual(
        expect.arrayContaining([1, 2])
      );
  });

  // search games
  it('should return searched game', async() => {
    const mockQueryBuilder = {
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(3),
      select: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue(mockGames)
    }

    jest.spyOn(ownedRepo, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

    const result = await service.searchGames('Game', testSteamId);

    expect(result.total).toBe(3);
    expect(result.totalPages).toBe(1);
    expect(result.games).toEqual(mockGames);
  });
});
