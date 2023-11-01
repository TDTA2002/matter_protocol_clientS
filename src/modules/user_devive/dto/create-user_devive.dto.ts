import { IsNotEmpty } from "class-validator";

export class CreateUserDeviveDto {
    @IsNotEmpty()
    userId: string;
}
