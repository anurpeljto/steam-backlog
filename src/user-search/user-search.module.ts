import { Module } from '@nestjs/common';
import { UserSearchService } from './user-search.service';
import { UserSearchController } from './user-search.controller';

@Module({
  providers: [UserSearchService],
  controllers: [UserSearchController]
})
export class UserSearchModule {}
