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

    async getTwitchToken(): Promise<string>{
        if (this.token) return this.token;

        const id = this.config.get('IGDB_CLIENT');
        const secret = this.config.get('IGDB_SECRET');

        const { data } = await firstValueFrom(
        this.http.post(
                    `https://id.twitch.tv/oauth2/token`,
                    null,
                    {
                    params: { client_id: id, client_secret: secret, grant_type: 'client_credentials' }
                    }
                )
            );

        this.token = data.access_token;
        return this.token;
    }

    async getGameTime(gameTitle: string) {
        console.log(`[IGDB] Fetching game time for: ${gameTitle}`);

        // try {
        //     await this.getTwitchToken();

        //     const query = `
        //         search "${gameTitle}";
        //         fields id,name;
        //         limit 5;
        //     `;

        //     let response;
        //     try {
        //         response = await firstValueFrom(
        //             this.http.post('https://api.igdb.com/v4/games', query, {
        //                 headers: {
        //                     'Authorization': `Bearer ${this.token}`,
        //                     'Client-ID': this.config.get('IGDB_CLIENT'),
        //                     'Content-Type': 'text/plain',
        //                 },
        //             })
        //         );
        //     } catch (err) {
        //         console.error(`[IGDB] Failed to search game "${gameTitle}":`, err.message);
        //         return null;
        //     }

        //     const data = response?.data ?? [];
        //     if (!data.length) {
        //         console.warn(`[IGDB] No results found for "${gameTitle}"`);
        //         return null;
        //     }

        //     const id = data[0]?.id;
        //     if (!id) {
        //         console.warn(`[IGDB] No valid ID found for "${gameTitle}"`);
        //         return null;
        //     }

        //     const nameQuery = `
        //         fields checksum, completely, count, created_at, hastily, normally, updated_at;
        //         where game_id = ${id};
        //     `;

        //     try {
        //         const gameTimeResponse = await firstValueFrom(
        //             this.http.post('https://api.igdb.com/v4/game_time_to_beats', nameQuery, {
        //                 headers: {
        //                     'Authorization': `Bearer ${this.token}`,
        //                     'Client-ID': this.config.get('IGDB_CLIENT'),
        //                     'Content-Type': 'text/plain',
        //                 },
        //             })
        //         );

        //         const gameTime = gameTimeResponse?.data?.[0] || null;
        //         console.log(`[IGDB] GameTime for "${gameTitle}" (id: ${id}):`, gameTime);
        //         return gameTime;

        //     } catch (err) {
        //         console.error(`[IGDB] Failed to fetch game_time_to_beats for "${gameTitle}" (id: ${id}):`, err.message);
        //         return null;
        //     }

        // } catch (outerErr) {
        //     console.error(`[IGDB] Unexpected error while fetching time for "${gameTitle}":`, outerErr.message);
        //     return null;
        // }

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
