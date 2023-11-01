import { Module } from '@nestjs/common';
import { UserDeviveService } from './user_devive.service';
import { UserDeviveController } from './user_devive.controller';

import { TypeOrmModule } from '@nestjs/typeorm';
import { UserDevice } from './entities/user_devive.entity';

@Module({
    imports: [TypeOrmModule.forFeature([UserDevice])],

  controllers: [UserDeviveController],
  providers: [UserDeviveService],
})
export class UserDeviveModule { }
