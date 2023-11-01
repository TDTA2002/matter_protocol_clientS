import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtService } from '../jwt/jwt.service';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { AuthenController } from './authen.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([User])
    ],
    controllers: [AuthenController],
    providers: [UsersService, JwtService],
})
export class AuthenModule {}