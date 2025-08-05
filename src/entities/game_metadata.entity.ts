import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('game_metadata')
export class GameMetadata {
  @PrimaryColumn()
  appid: number; 

  @Column({type: 'varchar', nullable: false})
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'json', nullable: true })
  genres: string[];

  @Column({ type: 'json', nullable: true })
  tags: string[];

  @Column({ type: 'json', nullable: true })
  categories: string[];

  @Column({ type: 'float8', nullable: true })
  hltb_main_story: number;

  @Column({ type: 'float8', nullable: true })
  hltb_100_percent: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  last_fetched: Date;

  @Column({type: 'varchar', nullable: true})
  header_image: string;

  @Column({type: 'bigint', nullable: true})
  rating: number | null;
}
