import { Injectable } from '@nestjs/common';
import { CreateBindingDto } from './dto/create-binding.dto';
import { UpdateBindingDto } from './dto/update-binding.dto';

@Injectable()
export class BindingService {
  create(createBindingDto: CreateBindingDto) {
    return 'This action adds a new binding';
  }

  findAll() {
    return `This action returns all binding`;
  }

  findOne(id: number) {
    return `This action returns a #${id} binding`;
  }

  update(id: number, updateBindingDto: UpdateBindingDto) {
    return `This action updates a #${id} binding`;
  }

  remove(id: number) {
    return `This action removes a #${id} binding`;
  }
}
