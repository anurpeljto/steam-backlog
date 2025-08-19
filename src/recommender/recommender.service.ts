// import { Injectable } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { EmbeddingsService } from 'src/embeddings/embeddings.service';
// import { GameMetadata } from 'src/entities/game_metadata.entity';
// import { GameEmbedding } from 'src/entities/GameEmbedding.entity';
// import { OwnedGame } from 'src/entities/ownedgame.entity';
// import { In, Repository } from 'typeorm';

// function cosine(a: number[], b: number[]) {
//     let dot = 0, na = 0, nb = 0;
//     for (let i = 0; i < a.length; i++){
//         const x = a[i] || 0, y = b[i] || 0;
//         dot += x*y; na += x*x; nb += y*y;
//     }
//     if (na === 0 || nb === 0) return 0;
//     return dot / (Math.sqrt(na) * Math.sqrt(nb));
// }

// @Injectable()
// export class RecommenderService {

//     constructor(
//         @InjectRepository(OwnedGame) private ownedRepo: Repository<OwnedGame>,
//         @InjectRepository(GameMetadata) private metaRepo: Repository<GameMetadata>,
//         @InjectRepository(GameEmbedding) private embedRepo: Repository<GameEmbedding>,
//         private embeddings: EmbeddingsService
//     ){}

//     private weightForGame(g: { playtime_minutes: number, isCompleted: boolean | null}) {
//         const hours = (g.playtime_minutes || 0) / 60;
//         const base = Math.log1p(hours);
//         const completedPenalty = g.isCompleted ? 0.7 : 1.0;
//         return Math.max(base, 0.3) * completedPenalty;
//     }

//     private average(vectors: number[][], weights: number[]) {
//         if (!vectors.length) return [];
//         const dim = vectors[0].length;
//         const sum = new Array(dim).fill(0);
//         let wsum = 0;
//         for (let i = 0; i < vectors.length; i++) {
//         const v = vectors[i], w = weights[i] ?? 1;
//         wsum += w;
//         for (let d = 0; d < dim; d++) sum[d] += (v[d] || 0) * w;
//         }
//         if (wsum === 0) return sum.map(() => 0);
//         return sum.map(x => x / wsum);
//     }

//     private normalizeRating(raw: number | null | undefined) {
//         if (!raw || raw <= 0) return 0;
//         return Math.min(Math.log10(1 + raw) / 5, 1);
//     }

//     private noveltyScore(playtimeMin: number | null | undefined, hltbMain: number | null | undefined) {
//         if (!hltbMain || hltbMain <= 0) return 0.5;
//         const hoursPlayed = (playtimeMin || 0) / 60;
//         const ratio = Math.min(hoursPlayed / hltbMain, 1);
//         return 1 - ratio; 
//     }

//     async recommendFromLibrary(steamId: string, limit = 10) {
//         const rows = await this.ownedRepo.createQueryBuilder('og')
//         .innerJoin('users', 'u', 'u.id = og.user_id')
//         .leftJoin('game_metadata', 'gm', 'gm.appid = og.appid')
//         .select([
//             'og.appid AS appid',
//             'og.playtime_minutes AS playtime_minutes',
//             'og.isCompleted AS isCompleted',
//             'gm.name AS name',
//             'gm.header_image AS header_image',
//             'gm.genres AS genres',
//             'gm.hltb_main_story AS hltb_main_story',
//             'gm.rating AS rating'
//         ])
//         .where('u.steam_id = :sid', { sid: steamId })
//         .getRawMany();

//         if (!rows.length) return [];

//         const appIds = rows.map(r => Number(r.appid));
//         const existing = await this.embedRepo.findBy({ appid: In(appIds) });
//         const existingById = new Map(existing.map(e => [Number(e.appid), e.embedding]));
//         const vectors: number[][] = [];
//         const weights: number[] = [];

//         for (const r of rows) {
//         let emb = existingById.get(Number(r.appid));
//         if (!emb) {
//             try { emb = await this.embeddings.ensureEmbedding(Number(r.appid)); }
//             catch { emb = undefined; }
//         }
//         if (emb && emb.length) {
//             vectors.push(emb);
//             weights.push(this.weightForGame(r));
//             existingById.set(Number(r.appid), emb);
//         }
//         }

//         const userVec = this.average(vectors, weights);
//         if (!userVec.length) return []; 
//         const scored = rows.map(r => {
//         const emb = existingById.get(Number(r.appid));
//         const sim = emb ? cosine(userVec, emb) : 0;

//         const ratingNorm = this.normalizeRating(r.rating);
//         const novelty = this.noveltyScore(r.playtime_minutes, r.hltb_main_story);

//         const combined =
//             0.60 * sim +        // matches your taste
//             0.20 * ratingNorm + // well-received generally
//             0.20 * novelty;     // underplayed for you

//         return { ...r, similarity: sim, ratingNorm, novelty, combinedScore: combined };
//         });

//         return scored
//         .filter(g => !g.iscompleted)  // your column returns snake_case in raw, adjust if needed
//         .sort((a, b) => b.combinedScore - a.combinedScore)
//         .slice(0, limit);
//     }
// }
