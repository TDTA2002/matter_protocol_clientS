import { Allow, IsNotEmpty } from "class-validator";

export class CreateDeviceDto {
    @IsNotEmpty()
    name: string;
    @IsNotEmpty()
    user_device_id: string;
    @Allow()
    node_id: number;
    @IsNotEmpty()
    active:boolean;
    @IsNotEmpty()
    status: boolean;
    @IsNotEmpty()
    power: number;
    // @IsNotEmpty()
    // dayConnect: string;
}