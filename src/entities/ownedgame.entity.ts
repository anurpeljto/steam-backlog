import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn, Unique } from 'typeorm';
import { User } from './user.entity';

@Entity('owned_games')
@Unique(['user', 'appid'])
export class OwnedGame {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.owned_games, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ unique: true})
  appid: number;

  @Column({ default: 0 })
  playtime_minutes: number;

  @Column({ type: 'timestamp', nullable: true })
  last_played: Date | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'boolean', nullable: true})
  isCompleted: boolean | null;
}
