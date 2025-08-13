import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom } from 'rxjs';
import Game, { GameResponse } from 'src/common/interfaces/game.interface';
import { GameMetadata } from 'src/entities/game_metadata.entity';
import { OwnedGame } from 'src/entities/ownedgame.entity';
import { User } from 'src/entities/user.entity';
import { In, Like, Repository } from 'typeorm';
import { MetadataQueue } from 'src/worker/metadata.queue';
import MetaData from 'src/common/interfaces/metadata.interface';

@Injectable()
export class GamesServiceService {
  constructor(
    @InjectRepository(OwnedGame) private ownedRepo: Repository<OwnedGame>,
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(GameMetadata) private metadataRepo: Repository<GameMetadata>,
    private http: HttpService,
    private metadataQueue: MetadataQueue,
    private config: ConfigService
  ) {}

  async fetchAndStoreUserGames(steamId: string) {
    let user = await this.usersRepo.findOne({ where: { steam_id: steamId } });
    if (!user) {
      user = this.usersRepo.create({ steam_id: steamId });
      await this.usersRepo.save(user);
    }

    const response = await firstValueFrom(
      this.http.get<GameResponse>(
        'https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/',
        {
          params: {
            key: this.config.get('STEAM_KEY'),
            steamid: steamId,
            include_appinfo: 1,
            format: 'json',
          },
        },
      ),
    );
    const games = response?.data?.response?.games || [];
    if(!games) {
      console.log('Missing response from GetOwnedGames');
      throw new Error('Missing response from GetOwnedGames');
    }
    for (const g of games) {
      
      await this.ownedRepo.upsert(
        {
          user: { id: user.id },
          appid: g.appid,
          playtime_minutes: g.playtime_forever,
          last_played: g.rtime_last_played
            ? new Date(g.rtime_last_played * 1000)
            : null,
        },
        ['user', 'appid'],
      );
    }

    const appIds = games.map((g: Game) => g.appid);
    const existingMetadata = await this.metadataRepo.findBy({
      appid: In<Number>(appIds),
    });

    if(!existingMetadata){
      throw new NotFoundException('User has no existing metadata');
    }
    
    const existingAppIds = new Set(existingMetadata.map((m: GameMetadata) => m.appid));
    const missingAppIds = appIds.filter((appid: number) => !existingAppIds.has(appid));

    for (const appid of missingAppIds) {
      await this.metadataQueue.addFetchJob(appid);
    }

    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - 7);

    for (const game of existingMetadata){
      if(
        ( game.hltb_100_percent === null ||
          game.hltb_main_story === null ||
          game.categories === null || 
          game.description === null ||
          game.header_image === null ||
          game.rating === null || 
          game.genres === null ) && 
          game.last_fetched <= thisWeek
      ){
        console.log(`Game ${game.name} is missing a field, `)
        await this.metadataQueue.addFetchJob(game.appid);
      }
    }

    return games.map((g) => ({
      appid: g.appid,
      playtime_minutes: g.playtime_forever,
      last_played: g.rtime_last_played,
      loadingMetadata: !existingAppIds.has(g.appid),
      expanded: false
    }));
  }

  async getUserGamesWithMetadata(
    steamId: string,
    page: number,
    size: number,
    filter: string | undefined,
    genre: string | undefined,
    category: string | undefined,
  ) {
    const user = await this.usersRepo.findOne({ where: { steam_id: steamId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const qb = await this.ownedRepo
      .createQueryBuilder('og')
      .leftJoin('game_metadata', 'gm', 'og.appid = gm.appid')
      .where('og.user_id = :userId', { userId: user.id });

    if (filter !== undefined) {
      qb.andWhere('og.playtime_minutes <= :filter', { filter });
    }

    if (genre) {
      qb.andWhere('gm.genres::jsonb @> :genre', {
        genre: JSON.stringify([genre]),
      });
    }

    if (category) {
      qb.andWhere('gm.categories::jsonb @> :category', {
        category: JSON.stringify([category]),
      });
    }

    const total = await qb.getCount();
    const totalPages = Math.ceil(total / size);
    const games = await qb
      .select([
        'og.appid AS appid',
        'og.playtime_minutes AS playtime_minutes',
        'og.last_played AS last_played',
        'gm.name AS name',
        'gm.header_image AS header_image',
        'gm.genres AS genres',
        'gm.categories AS categories',
        'gm.hltb_main_story AS main_story',
        'gm.hltb_100_percent AS hltb_100_percent',
        'og.isCompleted AS isCompleted',
        'gm.description AS description',
        'gm.rating AS rating'
      ])
      .limit(size)
      .offset(page * size)
      .getRawMany();

    return {
      total: total,
      totalPages: totalPages,
      games: games.map(game => ({
        ...game,
        expanded: false
      })),
    };
  }

  async getUserGamesGenres(steamid: string) {
    const genres = await this.ownedRepo
      .createQueryBuilder('og')
      .innerJoin('users', 'u', 'u.id = og.user_id')
      .innerJoin('game_metadata', 'gm', 'og.appid = gm.appid')
      .select('DISTINCT json_array_elements_text(gm.genres)', 'genre')
      .where('u.steam_id = :steamid', { steamid })
      .getRawMany();

    return {
      genres: genres.map((g) => ({
        genre: g.genre,
      })),
    };
  }

  async getRecommendedGames(steamid: string, amount?: string){
    const {games} = await this.getUserGamesWithMetadata(steamid, 0, 9999, undefined, undefined, undefined);
    const genreCount: Record<string, number> = {};
    games.forEach(g => {
      if (Array.isArray(g.genres)){
        g.genres.forEach((genre: string) => {
        genreCount[genre] = (genreCount[genre] || 0) + 1;
      });
    }
    });

    const total = Object.values(genreCount).reduce((a,b) => a+b, 0);
    const userVector = Object.fromEntries(Object.entries(genreCount).map(([k,v]) => [k, v/total]));

    const scored = games.map(g => {
      const gVector: Record<string, number> = {};
      if (Array.isArray(g.genres)){
        g.genres.forEach((genre: string) => gVector[genre] = 1);
      }
      const score = Object.keys(userVector).reduce(
        (sum, genre) => sum + (userVector[genre] || 0) * (gVector[genre] || 0),
        0
      );

      return {...g, score};
    });
    return scored
    .filter(g => g.iscompleted !== true)
    .map(g => {
      const ratingVal = g.rating && g.rating > 0 ? Math.log(g.rating) / 5 : 0;
      return {
        ...g,
        combinedScore: (g.score * 0.6) + (ratingVal*0.4)
      }
    })
    .sort((a,b) => b.combinedScore - a.combinedScore)
    .slice(0, Number(amount) || 10);
  }

  async searchGames(title: string, steamId: string, page: number = 0, size: number = 10) {
    const qb =  this.ownedRepo
      .createQueryBuilder('og')
      .innerJoin('users', 'u', 'og.user_id = u.id')
      .innerJoin('game_metadata', 'gm', 'og.appid = gm.appid')
      .where('u.steam_id = :steamId', {steamId})
      .andWhere('gm.name ILIKE :title', { title: `%${title}%`})

    const total = await qb.getCount();

    const games = await qb.select([
      'og.appid AS appid',
      'og.playtime_minutes AS playtime_minutes',
      'og.last_played AS last_played',
      'gm.name AS name',
      'gm.header_image AS header_image',
      'gm.genres AS genres',
      'gm.categories AS categories',
      'og.isCompleted AS isCompleted',
      'gm.rating AS rating',
      'gm.description AS description'
    ])
    .limit(size)
    .offset(page * size)
    .getRawMany();

    return {
      total,
      totalPages: Math.ceil(total / size),
      games: games.map(game => ({...game, expanded: false}))
    }
  }
}
