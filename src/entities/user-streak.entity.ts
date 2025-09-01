import {
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique
} from 'typeorm';
import { OwnedGame } from './ownedgame.entity';
import { User } from './user.entity';

@Entity('user_streaks')
@Unique(['user'])
export class UserStreak {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column( { type: 'int', nullable: true })
  appid: number | null;

  @Column({ default: 0 })
  current_streak: number;

  @Column({ default: 0 })
  longest_streak: number;

  @Column({
    type: 'enum',
    enum: ['active', 'finished', 'inactive'],
    default: 'active'
  })
  status: 'active' | 'finished' | 'inactive';

  @Column({ type: 'timestamp', nullable: true })
  grace_period_until: Date | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'varchar', nullable: true })
  game_title: string;
}
