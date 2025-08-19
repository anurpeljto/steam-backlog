import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { UsersController } from './users.controller';
import { AuthModule } from 'src/auth/auth.module';
import { AuthGuard } from 'src/common/guards/auth.guard';

@Module({
  providers: [UsersService, AuthGuard],
  imports: [TypeOrmModule.forFeature([User]),
  forwardRef(() => AuthModule)
],
  exports: [UsersService],
  controllers: [UsersController]
})
export class UsersModule {}
