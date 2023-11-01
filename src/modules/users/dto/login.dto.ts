import { Allow, IsNotEmpty } from "class-validator";

export class LoginDto {
    @IsNotEmpty()
    @Allow()
    userNameOrEmail: string;

    @IsNotEmpty()
    @Allow()
    password: string;
}