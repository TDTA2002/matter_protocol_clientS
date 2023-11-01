import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BindingService } from './binding.service';
import { CreateBindingDto } from './dto/create-binding.dto';
import { UpdateBindingDto } from './dto/update-binding.dto';

@Controller('binding')
export class BindingController {
  constructor(private readonly bindingService: BindingService) {}

  @Post()
  create(@Body() createBindingDto: CreateBindingDto) {
    return this.bindingService.create(createBindingDto);
  }

  @Get()
  findAll() {
    return this.bindingService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bindingService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBindingDto: UpdateBindingDto) {
    return this.bindingService.update(+id, updateBindingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bindingService.remove(+id);
  }
}
