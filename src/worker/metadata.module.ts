import { Module } from '@nestjs/common';
import { MetadataQueue } from './metadata.queue';
import { MetadataWorker } from './metadata.worker';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameMetadata } from 'src/entities/game_metadata.entity';
import { GameTimeModule } from 'src/modules/game-time/game-time.module';
import { WorkerModule } from './worker.module';
import { OwnedGame } from 'src/entities/ownedgame.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GameMetadata, OwnedGame]), GameTimeModule, WorkerModule],
  providers: [MetadataQueue, MetadataWorker],
  exports: [MetadataQueue]
})
export class MetadataModule {}
