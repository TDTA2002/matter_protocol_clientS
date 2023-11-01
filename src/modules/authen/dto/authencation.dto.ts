import { Allow } from "class-validator";

export class AuthenticationDto {
    @Allow()
    token: string;
}