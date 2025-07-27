import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { UserSearchModule } from './user-search/user-search.module';

@Module({
  imports: [AuthModule, UsersModule, ConfigModule.forRoot({isGlobal: true}), UserSearchModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
