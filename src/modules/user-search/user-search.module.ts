import { Module } from '@nestjs/common';
import { UserSearchService } from './user-search.service';
import { UserSearchController } from './user-search.controller';
import { GamesServiceModule } from 'src/modules/games-service/games-service.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  providers: [UserSearchService],
  controllers: [UserSearchController],
  imports: [
    GamesServiceModule,
    AuthModule,
  ]
})
export class UserSearchModule {}
