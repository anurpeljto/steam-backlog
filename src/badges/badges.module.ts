import { Module } from '@nestjs/common';
import { BadgesService } from './badges.service';
import { BadgesController } from './badges.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Badge } from 'src/entities/badge.entity';

@Module({
  providers: [BadgesService],
  imports: [TypeOrmModule.forFeature([Badge])],
  controllers: [BadgesController]
})
export class BadgesModule {}
