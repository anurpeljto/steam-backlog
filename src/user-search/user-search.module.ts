import { Module } from '@nestjs/common';
import { UserSearchService } from './user-search.service';
import { UserSearchController } from './user-search.controller';
import { GamesServiceModule } from 'src/games-service/games-service.module';
import { AuthModule } from 'src/auth/auth.module';
import { RecommenderModule } from 'src/recommender/recommender.module';

@Module({
  providers: [UserSearchService],
  controllers: [UserSearchController],
  imports: [
    GamesServiceModule,
    AuthModule,
    RecommenderModule
  ]
})
export class UserSearchModule {}
