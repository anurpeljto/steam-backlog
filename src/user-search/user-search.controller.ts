import { Controller, Get, HttpStatus, Param, Query } from '@nestjs/common';
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
    async getUserGamesFromDb(
        @Param('steamId') steamId: string,
        @Query('page') page: number = 0, 
        @Query('size') size: number = 50, 
        @Query('filter') filter: string,
        @Query('genre') genre: string,
        @Query('category')category: string
    ){
            
        return await this.gamesService.getUserGamesWithMetadata(steamId, page, size, filter, genre, category);
    }

    @Get('/games/:steamid/genres')
    async getUserGamesGenres(
        @Param('steamid') steamid: string
    ){
        return this.gamesService.getUserGamesGenres(steamid);
    }
}
