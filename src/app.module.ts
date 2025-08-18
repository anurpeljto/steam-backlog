import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserSearchModule } from './user-search/user-search.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { OwnedGame } from './entities/ownedgame.entity';
import { GameMetadata } from './entities/game_metadata.entity';
import { GamesServiceService } from './games-service/games-service.service';
import { HttpModule } from '@nestjs/axios';
import { GamesServiceModule } from './games-service/games-service.module';
import { MetadataModule } from 'src/worker/metadata.module';
import { GameTimeService } from './game-time/game-time.service';
import { GameTimeModule } from './game-time/game-time.module';
import { BadgesModule } from './badges/badges.module';

@Module({
  imports: [AuthModule, UsersModule, ConfigModule.forRoot({isGlobal: true}), UserSearchModule, HttpModule, MetadataModule, GamesServiceModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: config.get('DB_PORT') || 3000,
        username: config.get('DB_USER'),
        password: config.get('DB_PW'),
        database: config.get('DB_DB'),
        synchronize: true,
        autoLoadEntities: true,
        ssl: { rejectUnauthorized: false },
        entities: [User, OwnedGame, GameMetadata]
      })
    }),
    GamesServiceModule,
    GameTimeModule,
    BadgesModule,
  ],
  controllers: [AppController],
  providers: [AppService, GameTimeService],
})
export class AppModule {}
