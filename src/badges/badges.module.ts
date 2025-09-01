import { Module } from '@nestjs/common';
import { BadgesService } from './badges.service';
import { BadgesController } from './badges.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Badge } from 'src/entities/badge.entity';
import { UserBadges } from 'src/entities/user_badges.entity';
import { User } from 'src/entities/user.entity';
import { UserStreak } from 'src/entities/user-streak.entity';
import { OwnedGame } from 'src/entities/ownedgame.entity';
import { GameMetadata } from 'src/entities/game_metadata.entity';

@Module({
  providers: [BadgesService],
  imports: [TypeOrmModule.forFeature([Badge, UserBadges, User, UserStreak, OwnedGame, GameMetadata])],
  controllers: [BadgesController]
})
export class BadgesModule {}
