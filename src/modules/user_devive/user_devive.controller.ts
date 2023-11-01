import { Controller, Get, Post, Body, Patch, Param, Delete, Res } from '@nestjs/common';
import { UserDeviveService } from './user_devive.service';
import { CreateUserDeviveDto } from './dto/create-user_devive.dto';
import { UpdateUserDeviveDto } from './dto/update-user_devive.dto';
import  { Response } from 'express';

@Controller('user-devive')
export class UserDeviveController {
    constructor(private readonly userDeviveService: UserDeviveService) {}

  @Post()
  async create(@Body() createUserDeviveDto: CreateUserDeviveDto, @Res() res: Response) {
    // console.log("body",Body);
    // await console.log("createUserDeviveDto",createUserDeviveDto);
    
    
  }

}
