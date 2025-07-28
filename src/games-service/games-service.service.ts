import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom } from 'rxjs';
import { GameMetadata } from 'src/entities/game_metadata.entity';
import { OwnedGame } from 'src/entities/ownedgame.entity';
import { User } from 'src/entities/user.entity';
import { In, Repository } from 'typeorm';
import { MetadataQueue } from 'worker/metadata.queue';

@Injectable()
export class GamesServiceService {

    constructor(
        @InjectRepository(OwnedGame) private ownedRepo: Repository<OwnedGame>,
        @InjectRepository(User) private usersRepo: Repository<User>,
        @InjectRepository(GameMetadata) private metadataRepo: Repository<GameMetadata>,
        private http: HttpService,
        private metadataQueue: MetadataQueue
    ){}

    async fetchAndStoreUserGames(steamId: string){
        let user = await this.usersRepo.findOne({where: { steam_id: steamId}});
        if(!user) {
            user = this.usersRepo.create({steam_id: steamId});
            await this.usersRepo.save(user);
        }

        const response = await firstValueFrom(
            this.http.get('https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/', {
                params: { key: process.env.STEAM_KEY, steamid: steamId, include_appinfo: 1, format: 'json' },
            })
        );
        const games = response?.data?.response?.games || [];

        for(const g of games){
            await this.ownedRepo.upsert({
                user: {id: user.id},
                appid: g.appid,
                playtime_minutes: g.playtime_forever,
                last_played: g.rtime_last_played ? new Date(g.rtime_last_played * 1000) : null
            }, ['user', 'appid']);
        }

        const appIds = games.map(g => g.appid);
        const existingMetadata = await this.metadataRepo.findBy({appid: In(appIds)});
        const existingAppIds = new Set(existingMetadata.map(m => m.appid));
        const missingAppIds = appIds.filter(appid => !existingAppIds.has(appid));

        for (const appid of missingAppIds){
            await this.metadataQueue.addFetchJob(appid);
        }

        return games.map(g => ({
            appid: g.appid,
            playtime_minutes: g.playtime_forever,
            last_played: g.rtime_last_played,
            loadingMetadata: !existingAppIds.has(g.appid)
        }));
    }

    async getUserGamesWithMetadata(steamId: string){
        const user = await this.usersRepo.findOne({where: {steam_id: steamId}});
        if(!user){
            throw new NotFoundException('User not found');
        }

        const games = await this.ownedRepo
            .createQueryBuilder('og')
            .leftJoinAndSelect('game_metadata', 'gm', 'og.appid = gm.appid')
            .where('og.user_id = :userId', { userId: user.id})
            .select([
                'og.appid AS appid',
                'og.playtime_minutes AS playtime_minutes',
                'og.last_played AS last_played',
                'gm.name AS name',
                'gm.header_image AS header_image',
                'gm.genres AS genres',
            ])
            .getRawMany();

        return games.map(g => ({
            appid: g.appid,
            playtime_minutes: g.playtime_minutes,
            last_played: g.last_played,
            name: g.name || 'Unknown Game',
            header_image: g.header_image || 'fallback.png',
            loadingMetadata: !g.name,
            genres: g.genres
        }))
    }
}
