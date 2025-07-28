import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/LogInDto';
import { RegisterDto } from './dto/RegisterDto';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('/login')
  logIn(
    @Body() logInDto: LoginDto
  ) {
    return this.authService.login(logInDto.email, logInDto.password);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('/register')
  register(
    @Body() registerDto: RegisterDto
  ) {
    return this.authService.register(registerDto);
  }

  @Get('steam')
  async redirectToSteam(@Res() res: Response){
    const redirectUrl = await this.authService.getRedirectUrl();
    return res.redirect(redirectUrl);
  }

  @Get('steam/return')
  async handleSteamReturn(@Req() req: Request, @Res() res: Response) {
    const steamUser = await this.authService.validateSteamReturn(req);
    const token = await this.authService.generateToken(steamUser);
    return res.redirect(`http://localhost:4200/steam/callback?token=${token.access_token}`);
  }
}
