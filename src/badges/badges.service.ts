import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Badge } from 'src/entities/badge.entity';
import { Repository } from 'typeorm';
import { BadgeInterface } from './interfaces/badge.interface';

@Injectable()
export class BadgesService {
    
    constructor(
        @InjectRepository(Badge) private badgesRepo: Repository<Badge>,
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
}
