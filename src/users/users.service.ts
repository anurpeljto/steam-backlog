import { Injectable } from '@nestjs/common';
import { RegisterDto } from 'src/auth/dto/RegisterDto';

export type User = {
    first_name: string,
    last_name: string,
    email: string,
    password: string
}

@Injectable()
export class UsersService {
    private readonly users = [
        {
            first_name: 'John',
            last_name: 'Test',
            password: 'password',
            email: 'john@gmail.com'
        },
        {
            first_name: 'John',
            last_name: 'Test',
            password: 'password',
            email: 'john2@gmail.com'
        }
    ];

    async findUser(email: string): Promise<User | undefined> {
        return this.users.find(user => user.email === email);
    }

    async createUser(userData: RegisterDto) {
        this.users.push(userData);
    }
}
