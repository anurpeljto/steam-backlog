import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Badge } from 'src/entities/badge.entity';
import { DeepPartial, In, Repository } from 'typeorm';
import { BadgeInterface } from './interfaces/badge.interface';
import { UserBadges } from 'src/entities/user_badges.entity';
import { User } from 'src/entities/user.entity';
import { UserStreak } from 'src/entities/user-streak.entity';
import { ResponseTypes } from 'src/common/enums/response.enum';

@Injectable()
export class BadgesService {
    
    constructor(
        @InjectRepository(Badge) private badgesRepo: Repository<Badge>,
        @InjectRepository(UserBadges) private userBadgesRepo: Repository<UserBadges>,
        @InjectRepository(User) private usersRepo: Repository<User>,
        @InjectRepository(UserStreak) private streaksRepo: Repository<UserStreak>
    ){}

    getBadges(){
        return this.badgesRepo.find();
    }

    async getBadgeById(id: string){
        const badge = await this.badgesRepo.findOne({
            where: {
                id: Number(id)
            }
        });

        if(!badge){
            throw new NotFoundException('Badge not found');
        }

        return badge;
    }

    async createBadge(badge: BadgeInterface){
        const {name, description, condition} = badge;

        if (!name || !description || condition === undefined) {
            throw new Error('Missing required fields');
        }

        return await this.badgesRepo.save({
            name,
            description,
            condition
        });
    }

    async updateBadge(badge: BadgeInterface, badge_id: string){
        const {name, description, condition} = badge;

        if (!name || !description || condition === undefined) {
            throw new BadRequestException('Missing required fields');
        }

        const existingBadge = await this.badgesRepo.findOne({where: {
            id: Number(badge_id)
        }});

        if(!existingBadge){
            throw new NotFoundException(`Badge with id ${badge_id} not found`);
        }

        return this.badgesRepo.update({id: Number(badge_id)}, {
            name,
            description,
            condition
        });
    }

    async deleteBadge(badge_id: string){
        const deletedBadge = await this.badgesRepo.delete({
            id: Number(badge_id)
        });

        if(!deletedBadge){
            throw new NotFoundException(`Badge with id ${badge_id} not found`);
        }

        return deletedBadge;
    }

    async getUserBadges(steam_id: string) {
        const user = await this.usersRepo.findOne(
            {
                where: {
                    steam_id: steam_id
                }
            }
        );

        if(!user){
            throw new NotFoundException('User not found');
        }

        const userBadges = await this.userBadgesRepo.find({
            where: { user_id: user.id }
        });

        const badgeIds = userBadges.map(ub => ub.achievement_id);

        if (badgeIds.length === 0) return [];

        const badges = await this.badgesRepo.findBy({
            id: In(badgeIds)
        });
        return badges;
    }

    async unlockBadge(steam_id: string, badge_id: number){

        const user = await this.usersRepo.findOne({
            where: {
                steam_id: steam_id
            }
        });

        if(!user) {
            throw new NotFoundException('User with given id not found');
        }

        const badge = this.userBadgesRepo.create({
            user_id: user.id,
            achievement_id: badge_id,
            unlocked_at: new Date()
        })
        await this.userBadgesRepo.save(badge);
        return badge;
    }

    async userProgressPrompt(steam_id: string, response: ResponseTypes) {
        const user = await this.usersRepo.findOne({
            where: {
                steam_id: steam_id
            }
        });

        if(!user) {
            throw new NotFoundException('User with given id not found');
        }

        const streak = await this.streaksRepo.findOne({
            where: {
                user: { id: user.id }
            }
        });

        if(!streak){
            throw new NotFoundException('User has no streak');
        }

        if (response === ResponseTypes.No) {
            streak.current_streak = 1;
            streak.appid = null;
            streak.status = 'inactive';
            streak.updated_at = new Date();
        } else if (response === ResponseTypes.Yes) {
            streak.current_streak += 1;
            streak.status = 'active';
            streak.updated_at = new Date();
        } else {
            streak.status = 'finished';
            streak.grace_period_until = new Date(Date.now() + 72 * 60 * 60 * 1000);
        }
        
        await this.streaksRepo.save(streak);
        return streak;
    }

    async getUserStreak(steam_id: string) {
        const user = await this.usersRepo.findOne({
            where: {
                steam_id: steam_id
            }
        });

        if(!user) {
            throw new NotFoundException('User with given id not found');
        }

        return this.streaksRepo.findOne({
            where: {
                user: { id: user.id }
            }
        })
    }
}
