import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceModule } from './modules/devices/device.module';
import { UserDeviveModule } from './modules/user_devive/user_devive.module';
import { BindingModule } from './modules/binding/binding.module';
import { AuthenModule } from './modules/authen/authen.module';
import { SocketModule } from './modules/socket/socket.module';
@Module({

  imports: [ConfigModule.forRoot(),
  TypeOrmModule.forRoot({
    type: 'mysql',
    host: process.env.MY_SQL_HOST,
    port: Number(process.env.MY_SQL_PORT),
    username: process.env.MY_SQL_USERNAME,
    password: process.env.MY_SQL_PASSWORD,
    database: process.env.MYSQL_DBNAME,

    entities: ["dist/**/*.entity{.ts,.js}"],
    synchronize: true,
  }),
    UsersModule,
    DeviceModule,
    UserDeviveModule,
    BindingModule,
    AuthenModule,
    SocketModule,

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
