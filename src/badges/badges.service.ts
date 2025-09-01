import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Badge } from 'src/entities/badge.entity';
import { createQueryBuilder, DeepPartial, In, Repository } from 'typeorm';
import { BadgeInterface } from './interfaces/badge.interface';
import { UserBadges } from 'src/entities/user_badges.entity';
import { User } from 'src/entities/user.entity';
import { UserStreak } from 'src/entities/user-streak.entity';
import { ResponseTypes } from 'src/common/enums/response.enum';
import { OwnedGame } from 'src/entities/ownedgame.entity';
import { GameMetadata } from 'src/entities/game_metadata.entity';

@Injectable()
export class BadgesService {
    
    constructor(
        @InjectRepository(Badge) private badgesRepo: Repository<Badge>,
        @InjectRepository(UserBadges) private userBadgesRepo: Repository<UserBadges>,
        @InjectRepository(User) private usersRepo: Repository<User>,
        @InjectRepository(UserStreak) private streaksRepo: Repository<UserStreak>,
        @InjectRepository(OwnedGame) private ownedGameRepo: Repository<OwnedGame>,
        @InjectRepository(GameMetadata) private gameMetadataRepo: Repository<GameMetadata>
    ){}

    private async getUserBySteamId(steam_id: string): Promise<User> {
        const user = await this.usersRepo.findOne({ where: { steam_id } });
        if (!user) throw new NotFoundException('User not found');
        return user;
    }

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
        const user = await this.getUserBySteamId(steam_id);

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
        const user = await this.getUserBySteamId(steam_id);

        const badge = this.userBadgesRepo.create({
            user_id: user.id,
            achievement_id: badge_id,
            unlocked_at: new Date()
        })
        await this.userBadgesRepo.save(badge);
        return badge;
    }

    async userProgressPrompt(steam_id: string, response: ResponseTypes) {
        const user = await this.getUserBySteamId(steam_id);
        const streak = await this.streaksRepo.findOne({
            where: {
                user: { id: user.id }
            }
        });

        if(!streak){
            throw new NotFoundException('User has no streak');
        }

        if (response == ResponseTypes.No) {
            streak.current_streak = 1;
            streak.appid = null;
            streak.status = 'inactive';
            streak.updated_at = new Date();
        } else if (response == ResponseTypes.Yes) {
            streak.current_streak += 1;
            streak.status = 'active';
            streak.updated_at = new Date();
        } else if (response == ResponseTypes.Finished) {
            streak.status = 'finished';
            streak.grace_period_until = new Date(Date.now() + 72 * 60 * 60 * 1000);
        }

        await this.streaksRepo.save(streak);

        const badges = await this.badgesRepo.find();

        const unlockPromises = badges
            .filter(badge => streak.current_streak > badge.condition)
            .map(badge => this.unlockBadge(steam_id, badge.id));

        await Promise.all(unlockPromises);

        return streak;
    }

    async getUserStreak(steam_id: string) {
        const user = await this.getUserBySteamId(steam_id);

        return this.streaksRepo.findOne({
            where: {
                user: { id: user.id }
            }
        })
    }

    async markGameSelected(appid: number, steam_id: string, grace?: boolean){

        const user = await this.getUserBySteamId(steam_id);

        const user_id = user.id;

        const game = await this.ownedGameRepo.findOne({
            where: {
                appid,
                user: { id: user_id }
            }
        });

        if(!game){
            throw new NotFoundException('Game not found in this library');
        }

        const currentGame = await this.ownedGameRepo.findOne({
            where: {
                user: {id: user_id},
                isPlayingCurrently: true
            }
        });

        if(currentGame){
            currentGame.isPlayingCurrently = false;
            await this.ownedGameRepo.save(currentGame);
        }

        game.isPlayingCurrently = true;
        await this.ownedGameRepo.save(game);

        const gameData = await this.gameMetadataRepo.findOne({
            where: {
                appid
            }
        });

        if(!gameData){
            throw new NotFoundException('Game data not found');
        }
        
        const userStreak = await this.streaksRepo.findOne({
            where: {
                user: { id: user_id }
            }
        });

        if(userStreak){
            if(grace) {
                userStreak.current_streak = userStreak.current_streak;
                userStreak.appid = appid;
            }
            else {
                userStreak.current_streak = 1;
                userStreak.appid = appid;
                userStreak.status = 'active';
                userStreak.game_title = gameData.name
            }
            await this.streaksRepo.save(userStreak);
        }

        else {
            const newStreak = this.streaksRepo.create({
                user: { id: user_id },
                current_streak: 1,
                appid,
                status: 'active'
            });
            await this.streaksRepo.save(newStreak);
        }
    return game;
    }
}

