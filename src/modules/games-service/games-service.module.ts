import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameMetadata } from 'src/entities/game_metadata.entity';
import { OwnedGame } from 'src/entities/ownedgame.entity';
import { User } from 'src/entities/user.entity';
import { GamesServiceService } from './games-service.service';
import { MetadataModule } from 'src/worker/metadata.module';
import { GameTimeModule } from 'src/modules/game-time/game-time.module';

@Module({
    imports: [
        HttpModule,
        TypeOrmModule.forFeature([OwnedGame, User, GameMetadata]),
        MetadataModule,
        GameTimeModule
    ],
    providers: [GamesServiceService],
    exports: [GamesServiceService]
})
export class GamesServiceModule {}
