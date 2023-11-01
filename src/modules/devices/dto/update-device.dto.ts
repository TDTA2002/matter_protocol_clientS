
import { Allow, IsOptional } from "class-validator";

export class UpdateDeviceDto {
    @IsOptional()
     @Allow()
    name?:string

     @IsOptional()
       @Allow()
    status?: boolean;

    @IsOptional()
      @Allow()
    active?: boolean;

}

