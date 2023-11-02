import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '../jwt/jwt.service';
import { User } from './entities/user.entity';
import { FindByIdSerRes, UpdateSerRes } from './users.interface';
import validation from '../utils/validation';



@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private users: Repository<User>, private jwtService: JwtService) { }

  async register(CreateUserDto: CreateUserDto) {
    try {
      console.log("CreateUserDto", CreateUserDto);

      let newUser = this.users.create(CreateUserDto);
      let result = await this.users.save(newUser);

      return {
        status: true,
        message: "Register succsess!",
        data: result
      }

    } catch (err) {
      console.log("err", err);

      return {
        status: false,
        message: "Lỗi model",
        data: null
      }
    }
  }
  async findById(userId: string): Promise<FindByIdSerRes> {
    try {
      let result = await this.users.findOne({
        where: {
          id: userId
        }
      })
      if (!result) {
        throw new Error
      }
      return {
        status: true,
        data: result,
        message: "findById good!"
      }
    } catch (err) {
      return {
        status: false,
        data: null,
        message: "Lỗi model"
      }
    }
  }

  async update(userId: string, updateUserDto: UpdateUserDto): Promise<UpdateSerRes> {
    try {
      let userSource = await this.users.findOne({
        where: {
          id: userId
        }
      })
      let userSourceUpdate = this.users.merge(userSource, updateUserDto);
      let result = await this.users.save(userSourceUpdate);
      return {
        status: true,
        data: result,
        message: "Update ok!"
      }
    } catch (err) {
      console.log("err", err);

      return {
        status: false,
        data: null,
        message: "Lỗi model"

      }
    }
  }
  async findByEmailOrUserName(emailOrUserName: string): Promise<FindByIdSerRes> {
    try {
      let result = await this.users.findOne({
        where: validation.isEmail(emailOrUserName)
          ? {
            email: emailOrUserName,
            emailAuthentication: true
          }
          : {
            userName: emailOrUserName
          }
      });
      console.log("result", emailOrUserName);

      if (!result) {
        throw new Error
      }
      return {
        status: true,
        data: result,
        message: "find thành công"
      }
    } catch (err) {
      return { status: false, data: null, message: "lỗi" }
    }
  }

}
