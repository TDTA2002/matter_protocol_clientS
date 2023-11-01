import { Controller, Get, Post, Body, Patch, Param, Delete, Res } from '@nestjs/common';

import { Response } from 'express';
import * as  bcrypt from 'bcrypt'

import { JwtService } from '../jwt/jwt.service';
import { UsersService } from '../users/users.service';
import { AuthenticationDto } from './dto/authencation.dto';
// import jwt from 'src/utils/jwt';


@Controller('authen')
export class AuthenController {
    constructor(private readonly userService: UsersService, private readonly jwt: JwtService) { }

    @Post()
    async memberAuthentication(@Body() authenticationDto: AuthenticationDto, @Res() res: Response) {
        try {
            console.log("authenticationDto", authenticationDto);

            let userDecode = this.jwt.verifyToken(authenticationDto.token);
            console.log("userDecode", userDecode);

            if (userDecode) {
                let serResUser = await this.userService.findById(userDecode.id);
                console.log("serResUser", serResUser);

                if (serResUser.status) {
                    if (userDecode.updateAt == serResUser.data.updateAt) {
                        return res.status(200).json(serResUser);
                    }
                }
            }
            return res.status(213).json({
                message: "Authen failed!"
            })
        } catch {
            return res.status(500).json({
                message: "Lỗi controller"
            })
        }
    }

}