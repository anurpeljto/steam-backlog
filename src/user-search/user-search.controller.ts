import { Controller, Get, HttpStatus, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { GamesServiceService } from 'src/games-service/games-service.service';

@Controller('user-search')
export class UserSearchController {

    constructor(
        private gamesService: GamesServiceService
    ){}

    @UseGuards(AuthGuard)
    @Get('/games/:steamId')
    async getUserGames(@Param('steamId') steamId: string) {
        return await this.gamesService.fetchAndStoreUserGames(steamId);
    }

    @UseGuards(AuthGuard)
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

    @UseGuards(AuthGuard)
    @Get('/games/:steamid/genres')
    async getUserGamesGenres(
        @Param('steamid') steamid: string
    ){
        return this.gamesService.getUserGamesGenres(steamid);
    }

    @UseGuards(AuthGuard)
    @Get('/games/:steamid/recommended')
    async getRecommendedGames(
        @Param('steamid') steamid: string,
        @Query('amount') amount?: string
    ){
        return this.gamesService.getRecommendedGames(steamid, amount);
    }

    @UseGuards(AuthGuard)
    @Get('/games/:steamid/search')
    async searchGames(
        @Query('search') search: string,
        @Param('steamid') steamid: string,
        @Query('page') page: number,
        @Query('size') size: number
    ){
        return this.gamesService.searchGames(search, steamid, page, size);
    }
}
