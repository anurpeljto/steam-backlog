import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, map } from 'rxjs';


@Injectable()
export class GameTimeService {
    token: string;

    constructor(
        private http: HttpService,
        private config: ConfigService
    ){}

    async getGameTime(gameTitle: string) {
        console.log(`[RAWG] Fetching game time for: ${gameTitle}`);
        try{
                const gameData$ = this.http.get(`https://api.rawg.io/api/games`, {
                    params: {
                        key: this.config.get('RAWG_KEY'),
                        search: gameTitle
                    }                
                }).pipe(
                    map(
                        res => res.data
                    )
                );
                const gameData = await firstValueFrom(gameData$);
                const time = gameData.results[0].playtime;
                return time;
            } catch (error){
                console.log(`Error fetching gamedata for ${gameTitle}`);
            }
    }
}
