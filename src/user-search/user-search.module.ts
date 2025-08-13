import { Module } from '@nestjs/common';
import { UserSearchService } from './user-search.service';
import { UserSearchController } from './user-search.controller';
import { GamesServiceModule } from 'src/games-service/games-service.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthService } from 'src/auth/auth.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthGuard } from 'src/auth/auth.guard';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  providers: [UserSearchService],
  controllers: [UserSearchController],
  imports: [
    GamesServiceModule,
    AuthModule
  ]
})
export class UserSearchModule {}
