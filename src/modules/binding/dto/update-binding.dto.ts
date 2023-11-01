import { PartialType } from '@nestjs/mapped-types';
import { CreateBindingDto } from './create-binding.dto';

export class UpdateBindingDto extends PartialType(CreateBindingDto) {}
