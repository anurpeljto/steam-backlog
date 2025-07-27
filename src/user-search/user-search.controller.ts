import { Controller, Get, HttpStatus, Param } from '@nestjs/common';
import { UserSearchService } from './user-search.service';

@Controller('user-search')
export class UserSearchController {

    constructor(
        private userSearchService: UserSearchService
    ){}

    @Get("/games/:id")
    getUserData(@Param('id')userId: number){
        return this.userSearchService.findUser(userId);
    }
}
