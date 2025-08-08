import { Injectable, NotFoundException } from '@nestjs/common';
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

    getBadgeById(id: string){
        const badge = this.badgesRepo.findOne({
            where: {
                id: Number(id)
            }
        });

        if(!badge){
            throw new NotFoundException('Badge not found');
        }

        return badge;
    }

    createBadge(badge: BadgeInterface){
        const {name, description, condition} = badge;
        return this.badgesRepo.save({
            name,
            description,
            condition
        });
    }

    async updateBadge(badge: BadgeInterface, badge_id: string){
        const {name, description, condition} = badge;
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
        if(deletedBadge.affected === 0){
            throw new NotFoundException(`Badge with id ${badge_id} not found`);
        }

        return deletedBadge;
    }
}
