import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { UserDecorator } from 'src/common/decorators/user.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import extractToken from 'src/utils/extractToken';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {

    constructor(
        private userService: UsersService
    ){}

    @UseGuards(AuthGuard)
    @Post('update-description')
    async updateDescription(
        @UserDecorator() user: any,
        @Body() body: {
            description: string
        }
    ){
        return this.userService.updateUser(body.description, user.steam_id); 
    }

    @UseGuards(AuthGuard)
    @Get('find/:id')
    async findUser(
        @Param('id') id: string
    ){
        return this.userService.findUser(id);
    }
}
