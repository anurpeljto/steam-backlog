import { HttpService } from '@nestjs/axios';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OwnedGame } from 'src/entities/ownedgame.entity';
import { User } from 'src/entities/user.entity';
import { createQueryBuilder, Repository } from 'typeorm';

@Injectable()
export class GameStatusService {

    constructor(
        @InjectRepository(OwnedGame) private ownedGame: Repository<OwnedGame>,
        @InjectRepository(User) private users: Repository<User>,
        private http: HttpService
    ){}

    async markCompleted(steam_id: string, appid: number){
        const user = await this.users.findOne({where: {steam_id}});
        if(!user) {
            throw new NotFoundException('User not found');
        }

        const og = await this.ownedGame.createQueryBuilder('og')
            .innerJoin('users', 'u', 'u.id = og.user_id')
            .where('og.appid = :appid', {appid})
            .andWhere('u.steam_id = :steam_id', {steam_id})
            .getOne()

        if(!og) throw new NotFoundException('Game not found');

        og.isCompleted = true;
        await this.ownedGame.save(og);
    }

    async markNotCompleted(steam_id: string, appid: number){
        const user = await this.users.findOne({where: {steam_id}});
        if(!user) {
            throw new NotFoundException('User not found');
        }

        const og = await this.ownedGame.createQueryBuilder('og')
            .innerJoin('users', 'u', 'u.id = og.user_id')
            .where('og.appid = :appid', {appid})
            .andWhere('u.steam_id = :steam_id', {steam_id})
            .getOne()

        if(!og) throw new NotFoundException('Game not found');

        og.isCompleted = false;
        await this.ownedGame.save(og);
    }
}
