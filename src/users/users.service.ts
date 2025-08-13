import { BadRequestException, Injectable } from '@nestjs/common';
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
}
