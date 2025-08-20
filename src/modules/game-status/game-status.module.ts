import { Module } from '@nestjs/common';
import { GameStatusController } from './game-status.controller';
import { HttpModule } from '@nestjs/axios';
import { GameStatusService } from './game-status.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OwnedGame } from 'src/entities/ownedgame.entity';
import { AuthModule } from 'src/auth/auth.module';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { User } from 'src/entities/user.entity';

@Module({
  controllers: [GameStatusController],
  imports: [
    HttpModule,
    AuthModule,
    TypeOrmModule.forFeature([OwnedGame, User])
  ],
  providers: [
    GameStatusService,
    AuthGuard
  ]
})
export class GameStatusModule {}
