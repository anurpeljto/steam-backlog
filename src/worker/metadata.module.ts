import { Module } from '@nestjs/common';
import { MetadataQueue } from './metadata.queue';
import { MetadataWorker } from './metadata.worker';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameMetadata } from 'src/entities/game_metadata.entity';
import { GameTimeModule } from 'src/game-time/game-time.module';
import { WorkerModule } from './worker.module';

@Module({
  imports: [TypeOrmModule.forFeature([GameMetadata]), GameTimeModule, WorkerModule],
  providers: [MetadataQueue, MetadataWorker],
  exports: [MetadataQueue]
})
export class MetadataModule {}
