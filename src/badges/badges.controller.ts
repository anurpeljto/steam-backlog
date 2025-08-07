import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { BadgesService } from './badges.service';
import { BadgeInterface } from './interfaces/badge.interface';

@Controller('badges')
export class BadgesController {

    constructor(
        private badgeService: BadgesService
    ){}

    @Get('all')
    getAllBadges(){
        return this.badgeService.getBadges();
    }

    @Get(':id')
    getBadgeById(
        @Param('id') badge_id: string
    ){
        return this.badgeService.getBadgeById(badge_id);
    }

    @Post('create')
    createBadge(
        @Body() badge: BadgeInterface
    ){
        return this.badgeService.createBadge({...badge});
    }

    @Put(':id')
    updateBadge(
        @Body() badge: BadgeInterface,
        @Param('id') badge_id: string
    ){
        return this.badgeService.updateBadge(badge, badge_id);
    }

    @Delete(':id')
    deleteBadge(
        @Param('id') badge_id: string
    ){
        return this.badgeService.deleteBadge(badge_id);
    }
}
