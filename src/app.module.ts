import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { UserSearchModule } from './user-search/user-search.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { OwnedGame } from './entities/ownedgame.entity';
import { GameMetadata } from './entities/game_metadata.entity';
import { GamesServiceService } from './games-service/games-service.service';
import { HttpModule } from '@nestjs/axios';
import { GamesServiceModule } from './games-service/games-service.module';
import { MetadataModule } from 'worker/metadata.module';

@Module({
  imports: [AuthModule, UsersModule, ConfigModule.forRoot({isGlobal: true}), UserSearchModule, HttpModule, MetadataModule, GamesServiceModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'steam-backlog-tutshack4-a083.l.aivencloud.com',
      port: 23849,
      username: 'avnadmin',
      password: 'AVNS_hs6bbcgov8xxFW9P3f4',
      database: 'defaultdb',
      synchronize: true,
      autoLoadEntities: true,
      entities: [
        User,
        OwnedGame,
        GameMetadata
      ],
      ssl: {rejectUnauthorized: false} 
    }),
    GamesServiceModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
