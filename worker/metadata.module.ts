import { Module } from '@nestjs/common';
import { MetadataQueue } from './metadata.queue';
import { MetadataWorker } from './metadata.worker';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameMetadata } from 'src/entities/game_metadata.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GameMetadata])],
  providers: [MetadataQueue, MetadataWorker],
  exports: [MetadataQueue]
})
export class MetadataModule {}
