import { Controller, Get, HttpStatus, Param } from '@nestjs/common';
import { GamesServiceService } from 'src/games-service/games-service.service';

@Controller('user-search')
export class UserSearchController {

    constructor(
        private gamesService: GamesServiceService
    ){}

    @Get('/games/:steamId')
    async getUserGames(@Param('steamId') steamId: string) {
        return await this.gamesService.fetchAndStoreUserGames(steamId);
    }

    @Get('/games/:steamId/metadata')
    async getUserGamesFromDb(@Param('steamId') steamId: string){
        return await this.gamesService.getUserGamesWithMetadata(steamId);
    }
}
