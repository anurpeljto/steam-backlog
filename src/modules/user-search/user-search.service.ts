import { Injectable } from '@nestjs/common';
import { Environment } from 'environment/environment';

@Injectable()
export class UserSearchService {

    async findUser(userId: number){
        const response = await fetch(`${Environment.apiUrl}${userId}`);
        if(!response.ok){
            throw new Error('Failed to parse steam data'); 
        }

        const res = await response.json();
        return res;
    }
}
