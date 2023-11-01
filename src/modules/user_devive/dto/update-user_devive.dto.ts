import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDeviveDto } from './create-user_devive.dto';

export class UpdateUserDeviveDto extends PartialType(CreateUserDeviveDto) {}
