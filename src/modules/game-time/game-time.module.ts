import { Module } from '@nestjs/common';
import { GameTimeService } from './game-time.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

@Module({
    exports: [GameTimeService],
    imports: [ConfigModule, HttpModule],
    providers: [GameTimeService]
})
export class GameTimeModule {}
