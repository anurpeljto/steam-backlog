import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import GameDetailsResponse from './interfaces/game-details.interface';
import { map } from 'rxjs';

@Injectable()
export class WorkerService {

    constructor(
        private http: HttpService
    ){}

    async getGameDetails(appid: number){
        return this.http.get<GameDetailsResponse>(`https://store.steampowered.com/api/appdetails`, {
            params: { appid, l: 'english'}
        }).pipe(
            map(response => response.data)
        );
    }
}
