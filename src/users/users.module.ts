import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from './entities/users.entity';
import { UserService } from './users.service';
import { UserController } from './users.controller';
import { CustomLogger } from '../logger.service'

@Module({
  imports: [TypeOrmModule.forFeature([Users])],
  providers: [UserService, CustomLogger],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}