import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Query, Render } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiTags } from '@nestjs/swagger';
import { MailService, templates } from '../mail/mail.service';
import { JwtService } from '../jwt/jwt.service';
import { Response, Request } from 'express';
import { LoginDto } from './dto/login.dto';
import * as  bcrypt from 'bcrypt'
import { ResetPasswordDto } from './dto/reset-password.dto';
import { checkOtp, createOtp } from '../otp/otp.service';
import * as path from 'path';
import * as ejs from 'ejs';
import { ChangePasswordDto } from './dto/change-password.dto';
// import common from 'src/utils/common';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService, private readonly mail: MailService, private readonly jwt: JwtService) { }

  @Post()
  async register(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
    try {
      let serRes = await this.usersService.register(createUserDto);
      console.log("serRes.status", serRes);

      if (serRes.status) {
        /* Mail */
        this.mail.sendMail({
          subject: "Register Authentication Email",
          to: serRes.data.email,
          html: templates.emailConfirm({
            confirmLink: `${process.env.HOST}:${process.env.PORT}/api/v1/users/email-authentication/${serRes.data.id}/${this.jwt.createToken(serRes.data, "300000")}`,
            language: "vi",
            productName: "Master Protocol",
            productWebUrl: "https://csa-iot.org/all-solutions/matter/",
            receiverName: `${serRes.data.userName}`
          })
        })

      }


      return res.status(serRes.status ? 200 : 213).json(serRes);
    } catch (err) {
      return res.status(500).json({
        message: "Server Controller Error!"
      });
    }
  }


  @Get('email-authentication/:userId/:token')
  @Render('sucess')
  async emailAuthentication(@Param('userId') userId: string, @Param('token') token: string, @Res() res: Response) {
    try {
      let userDecode = this.jwt.verifyToken(token);
      let serResUser = await this.usersService.findById(userId);
      if (serResUser.status && userDecode) {
        if (serResUser.data.updateAt == userDecode.updateAt) {
          if (!serResUser.data.emailAuthentication) {
            let serRes = await this.usersService.update(userId, {
              emailAuthentication: true
            });
            console.log("serRes", serRes)
            if (serRes.status) {
              this.mail.sendMail({
                subject: "Authentication Email Notice",
                to: serRes.data.email,
                text: `Email đã được liên kết với tài khoản ${serRes.data.userName}`
              })
            }
            return
          } else {
            return res.status(213).send("Tài khoản đã kích hoạt email!");
          }
        }
      }

      return res.status(213).send("Email đã hết hạn!");
    } catch (err) {
      return res.status(500).json({
        message: "Server Controller Error!"
      });
    }
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    try {
      console.log("loginDto", loginDto);

      let serRes = await this.usersService.findByEmailOrUserName(loginDto.userNameOrEmail);

      if (!serRes.status) {
        return res.status(213).json({
          message: "Không tìm thấy tài khoản"
        });
      }

      if (serRes.data.status != "ACTIVE") {
        return res.status(213).json({
          message: `Tài khoản bị ${serRes.data.status}`
        });
      }

      if (!(await bcrypt.compare(loginDto.password, serRes.data.password))) {
        return res.status(213).json({
          message: "Mật khẩu không chính xác"
        });
      }
      /* Mail */
      this.mail.sendMail({
        subject: "Login Authentication Email",
        to: serRes.data.email,
        // text: `Tài khoản của bạn vừa được login ở một thiết bị mới`,
        html: templates.emailLogin({
          // confirmLink: `${process.env.HOST}:${process.env.PORT}/`,
          language: "vi",
          productName: "Master Protocol",
          productWebUrl: "https://csa-iot.org/all-solutions/matter/",
          receiverName: `${serRes.data.userName}`
        })
      })

      return res.status(200).json({
        token: this.jwt.createToken(serRes.data, '1d')
      });
      // return res.status(serRes.status ? HttpStatus.OK : HttpStatus.BAD_REQUEST).json(serRes);
    } catch (err) {
      return res.status(500).json({
        message: "Server Controller Error!"
      });
    }
  }
  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto, @Res() res: Response) {
    try {
      let serResUser = await this.usersService.findByEmailOrUserName(resetPasswordDto.email);
      let token = this.jwt.createToken(serResUser.data, "300000")

      if (serResUser) {
        await this.mail.sendMail({
          subject: "Reset Password",
          to: resetPasswordDto.email,
          html: templates.emailResetPassword({
            confirmLink: `${process.env.HOST}:${process.env.PORT}/api/v1/users/authentication-reset-password/${token}`,
            language: "vi",
            productName: "Master Protocol",
            productWebUrl: "https://csa-iot.org/all-solutions/matter/",
            receiverName: ``
          })
        })
        // let template = await ejs.renderFile(
        //   path.join(__dirname, "src/utils/ejs/reset-password.ejs"),
        //   { user: serResUser.data, token }
        // )
        return res
          .status(200).json({
            message: "Please Check your email!"
          });
      }
    } catch (err) {
      return res
        .status(500).json({
          message: "Server Controller Error!"
        });
    }
  }

  @Get('reset-password/:token')
  @Render('sucess')

  async authenticationResetPassword(@Param('token') token: string, @Query('newPassword') newPassword: string, @Res() res: Response) {
    try {
      let userDecode = this.jwt.verifyToken(token);

      if (userDecode) {
        let serResUser = await this.usersService.findById(userDecode.id);
        if (serResUser.data.updateAt == userDecode.updateAt) {
          if (serResUser.status) {
            if (serResUser.data.updateAt == userDecode.updateAt) {

              let serUpdateUser = await this.usersService.update(userDecode.id, {

                password: await bcrypt.hash(newPassword, 10)
              })
              // let serUpdateUser = await this.usersService.update(userDecode.id, {
              //   password: await bcrypt.hash(userDecode.newPassword, 10)
              // })
              console.log("serUpdateUser", serUpdateUser);

              if (serUpdateUser.status) {
                return
              }
            }
          }
        }
      }
      return res.status(213).json({
        message: "Xác thực thất bại!"
      })
    } catch (err) {
      console.log("err", err);

      return res.status(500).json({
        message: "Server Controller Error!"
      });
    }
  }

  // @Get('authentication-reset-password/:token')
  // async authenticationResetPassword(@Param('token') token: string, @Res() res: Response) {
  // try {
  //   let userDecode = this.jwt.verifyToken(String(token));
  //   if (userDecode) {
  //     let serResUser = await this.usersService.findById(userDecode.id);
  //     if (serResUser.data.updateAt == userDecode.updateAt) {
  //       if (serResUser.status) {
  //         if (serResUser.data.updateAt == userDecode.updateAt) {
  //           let randomPassword = common.generateOTP();
  //           let serUpdateUser = await this.usersService.update(userDecode.id, {
  //             password: await bcrypt.hash(randomPassword, 10)
  //           })
  //           if (serUpdateUser.status) {
  //             await this.mail.sendMail({
  //               subject: "Khôi phục mật khẩu",
  //               to: userDecode.email,
  //               html: `
  //                 <h2>Mật khẩu của bạn là</h2>
  //                 <span>${randomPassword}</span>
  //               `
  //             })

  //             return res.status(200).send("Check your mail!")
  //           }
  //         }
  //       }
  //     }
  //   }

  //   return res.status(213).json({
  //     message: "Xác thực thất bại!"
  //   })
  // } catch (err) {
  //   return res.status(500).json({
  //     message: "Server Controller Error!"
  //   });
  // }
  @Get('authentication-reset-password/:token')
  @Render('index')
  async Renderejs(@Param('token') token: string, @Res() res: Response) {
    return { message: 'Trang chủ', token };
  }

}
