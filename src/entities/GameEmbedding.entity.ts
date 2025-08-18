import { Column, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm";

@Entity('game_embeddings')
export class GameEmbedding {
    @PrimaryColumn('bigint')
    appid: number;

    @Column({ type: 'jsonb' })
    embedding: number[];

    @Column({ type: 'text' })
    model: string;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}