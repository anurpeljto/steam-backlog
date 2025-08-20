// import { Injectable } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { InjectRepository } from '@nestjs/typeorm';
// import OpenAI from 'openai';
// import { GameMetadata } from 'src/entities/game_metadata.entity';
// import { GameEmbedding } from 'src/entities/GameEmbedding.entity';
// import { Repository } from 'typeorm';

// @Injectable()
// export class EmbeddingsService {
//     private client: OpenAI;
//     private model = 'text-embedding-3-small';

//     constructor(
//         @InjectRepository(GameMetadata) private gameMetadata: Repository<GameMetadata>,
//         @InjectRepository(GameEmbedding) private gameEmbedding: Repository<GameEmbedding>,
//         private configService: ConfigService
//     ){
//         this.client = new OpenAI({ apiKey: this.configService.get('OPEN_AI_KEY')});
//     }

//     private buildGameText(meta: GameMetadata){
//         const genres = Array.isArray(meta.genres) ? meta.genres.join(',') : '';
//         const categories = Array.isArray(meta.categories) ? meta.categories.join(', ') : '';
//         const tags = Array.isArray(meta.tags) ? meta.tags.join(', ') : '';
//         const desc = meta.description ?? '';
//         const name = meta.name ?? '';
        
//         return [
//             name,
//             genres ? `Genres: ${genres}.` : '',
//             categories ? `Categories: ${categories}.` : '',
//             tags ? `Tags: ${tags}.` : '',
//             desc
//             ].filter(Boolean).join(' ');
//     }

//     async ensureEmbedding(appid: number): Promise<number[]>{
//         const existing = await this.gameEmbedding.findOne({where: { appid }});
//         if(existing?.embedding?.length) return existing.embedding;

//         const meta = await this.gameMetadata.findOne({where: { appid }});
//         if(!meta) throw new Error(`No metadata for ${appid}`);

//         const input = this.buildGameText(meta);
//         const resp = await this.client.embeddings.create({
//             model: this.model,
//             input
//         });

//         const embedding = resp.data[0].embedding as number[];
//         await this.gameEmbedding.save({ appid, embedding, model: this.model });
//         return embedding;
//     }
// }
