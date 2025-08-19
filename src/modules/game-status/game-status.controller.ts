import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { GameStatusService } from './game-status.service';
import { UserDecorator } from 'src/common/decorators/user.decorator';

@Controller('game-status')
export class GameStatusController {

    constructor(
        private gameStatusService: GameStatusService,
    ){}

    @UseGuards(AuthGuard)
    @Post('completed')
    async markCompleted(
        @UserDecorator() user: any,
        @Body() body: {
            appid: number
        }
    ){
        return this.gameStatusService.markCompleted(user.steam_id , body.appid);
    }

    @UseGuards(AuthGuard)
    @Post('not-completed')
    async markNotCompleted(
        @UserDecorator() user: any,
        @Body() body: {
            appid: number
        }
    ){
        return this.gameStatusService.markNotCompleted(user.steam_id , body.appid)
    }
}
