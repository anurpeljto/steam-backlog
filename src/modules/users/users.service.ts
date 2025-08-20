import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RegisterDto } from 'src/auth/dto/RegisterDto';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {

    constructor(
        @InjectRepository(User) private users: Repository<User>
    ){}


    async findUser(steamid: string): Promise<User | null> {
        return this.users.findOne({
            where: {
                steam_id: steamid
            }
        });
    }

    async createUser(userData: Partial<User>) {
        const user = await this.users.findOne({where: {
            steam_id: userData.steam_id
        }});
        if(user){
            throw new BadRequestException('User already exists');
        }
        const newUser = this.users.create(userData);
        return await this.users.save(newUser);
    }

    async updateUser(description: string, steam_id: string){
        const result = await this.users.update({steam_id: steam_id}, { description});
        if(result.affected === 0){
            throw new NotFoundException('User not found');
        }

        return this.users.findOne({where: {steam_id: steam_id}})
    }
}
