import { Module } from '@nestjs/common';
import { RecommenderService } from './recommender.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OwnedGame } from 'src/entities/ownedgame.entity';
import { GameMetadata } from 'src/entities/game_metadata.entity';
import { GameEmbedding } from 'src/entities/GameEmbedding.entity';
import { EmbeddingsModule } from 'src/embeddings/embeddings.module';

@Module({
    imports: [TypeOrmModule.forFeature([OwnedGame, GameMetadata, GameEmbedding]),
        EmbeddingsModule],
    providers: [RecommenderService],
    exports: [RecommenderService]
})
export class RecommenderModule {}
