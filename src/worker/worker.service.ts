import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import GameDetailsResponse from './interfaces/game-details.interface';
import { firstValueFrom, map, timeout } from 'rxjs';

@Injectable()
export class WorkerService {

    constructor(
        private http: HttpService
    ){}

    async getGameDetails(appid: number){
        const obs = this.http.get<GameDetailsResponse>(`https://store.steampowered.com/api/appdetails`, {
            params: { appids: appid, l: 'english'}, headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
                '(KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
                'Accept': 'application/json'
            }
        }).pipe(
            map(response => response.data)
        );
        return firstValueFrom(obs);
    }
}
