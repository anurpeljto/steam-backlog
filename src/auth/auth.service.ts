import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/modules/users/users.service';
import { RegisterDto } from './dto/RegisterDto';
import * as openid from 'openid';
import axios from 'axios';

const relyingParty = new openid.RelyingParty(
  'http://localhost:3000/auth/steam/return', 
  'http://localhost:3000/', 
  true, // 
  false,
  []
);

@Injectable()
export class AuthService {

    constructor(
        private userService: UsersService,
        private jwtService: JwtService
    ){}

    // async login(email: string, password: string) {
    //     const user = await this.userService.findUser(email);
    //     if(!user){
    //         throw new BadRequestException('User with this email does not exist');
    //     }
        
    //     if(user.password !== password) {
    //         throw new UnauthorizedException('Incorrect email or password combination');
    //     }

    //     const payload = {
    //         sub: user.email,
    //         email: user.email,
    //         first_name: user.first_name,
    //         last_name: user.last_name
    //     }

    //     return {
    //         access_token: await this.jwtService.signAsync(payload)
    //     }
    // }

    // async register(registerDto: RegisterDto) {
    //     const user = await this.userService.findUser(registerDto.email);
    //     if(user){
    //         throw new BadRequestException('User with given email already exists');
    //     }

    //     await this.userService.createUser(registerDto);

    //     return this.login(registerDto.email, registerDto.password);
    // }

    async getRedirectUrl(): Promise<string> {
        return new Promise((res, rej) => {
            relyingParty.authenticate(
                'https://steamcommunity.com/openid',
                false,
            (error, authUrl) => {
                if (error || !authUrl){
                    return rej('Steam auth failed')
                }
                res(authUrl);
            }
            )
        })
    }

    async validateSteamReturn(req: any): Promise<any> {
        return new Promise((res, rej) => {
            relyingParty.verifyAssertion(req, async (error, result) => {
                console.log('Steam OpenID verify error:', error);
                console.log('Steam OpenID verify result:', result);

                if (error || !result || !result.authenticated) {
                    return rej(new UnauthorizedException('Steam login failed'));
                }

                const steamIdMatch = result.claimedIdentifier.match(/\/id\/(\d+)$/) ||
                                    result.claimedIdentifier.match(/\/openid\/id\/(\d+)$/);
                const steamId = steamIdMatch?.[1];

                if (!steamId) {
                    return rej(new UnauthorizedException('Invalid SteamID'));
                }

                try {
                    const { data } = await axios.get('https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/', {
                        params: {
                            key: process.env.STEAM_KEY,
                            steamids: steamId,
                        },
                    });
                     if (!data || !data.response || !data.response.players || data.response.players.length === 0) {
                        console.error('Steam API returned no player data:', data);
                        return rej(new UnauthorizedException('Failed to fetch Steam profile'));
                    }

                    const player = data.response.players[0];

                    let user = await this.userService.findUser(steamId);

                    if(!user){
                        user = await this.userService.createUser({
                            steam_id: steamId,
                            username: player.personaname
                        })
                    }

                    const token = await this.jwtService.signAsync({
                        sub: user.id,
                        steam_id: steamId,
                        personaname: player.personaname,
                        avatar: player.avatarfull,
                        profileUrl: player.profileurl,
                        description: user.description
                    });

                    res({
                        access_token: token,
                        user
                    });

                } catch (fetchError) {
                    // console.log(fetchError);
                    rej(new UnauthorizedException('Failed to fetch Steam profile'));
                }
            });
        });
    }
    
    async generateToken(userData: any) {
        const payload = {
            steam_id: userData.steamid,
            personaname: userData.personaname,
            avatar: userData.avatar,
            profileUrl: userData.profileurl
        }

        return {
            access_token: await this.jwtService.signAsync(payload)
        };
    }
}
