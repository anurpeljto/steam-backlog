import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';


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
            {
            params: { client_id: id, client_secret: secret, grant_type: 'client_credentials' }
            }
        )
        );

        this.token = data.access_token;
        return this.token;
    }

    async getGameTime(gameTitle: string) {
        await this.getTwitchToken();
        const query = `
                search "${gameTitle}";
                fields id,name;
                limit 5;
        `;
        const response = await firstValueFrom(this.http.post(
              'https://api.igdb.com/v4/games',
              query,
              {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Client-ID': `${this.config.get('IGDB_CLIENT')}`,
                    'Content-Type': 'text/plain'
                }
              }
        ));

        const data = response?.data ?? [];
        const id = data[0].id || null;
        if (!id) {
            throw new Error('Game not found');
        }

        const nameQuery = `fields checksum, completely, count, created_at, hastily, normally, updated_at; where game_id = ${id};`

        const gameTime = await firstValueFrom(this.http.post(
            'https://api.igdb.com/v4/game_time_to_beats',
            nameQuery,
            {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Client-ID' : `${this.config.get('IGDB_CLIENT')}`,
                    'Content-Type': 'text/plain'
                }
            }
        ));
        return gameTime?.data[0] || [];
    }
}
