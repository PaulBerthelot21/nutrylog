import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { MealsService } from './meals.service';
import { CreateMealDto } from './dto/create-meal.dto';
import { UpdateMealDto } from './dto/update-meal.dto';
import { AddItemDto } from './dto/add-item.dto';

@Controller('meals')
export class MealsController {
  constructor(private readonly mealsService: MealsService) {}

  @Post()
  create(@Body() createMealDto: CreateMealDto) {
    return this.mealsService.create(createMealDto);
  }

  @Get()
  findAll() {
    return this.mealsService.findAll();
  }

  @Get('date/:date')
  findByDate(@Param('date') date: string) {
    return this.mealsService.findByDate(date);
  }

  @Get('range')
  findByDateRange(
    @Query('start') startDate: string,
    @Query('end') endDate: string,
  ) {
    return this.mealsService.findByDateRange(startDate, endDate);
  }

  @Get('summary/:date')
  getDailySummary(@Param('date') date: string) {
    return this.mealsService.getDailySummary(date);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.mealsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMealDto: UpdateMealDto,
  ) {
    return this.mealsService.update(id, updateMealDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.mealsService.remove(id);
  }

  @Post(':id/items')
  addItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() addItemDto: AddItemDto,
  ) {
    return this.mealsService.addItem(id, addItemDto);
  }

  @Delete(':id/items/:itemId')
  removeItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
  ) {
    return this.mealsService.removeItem(id, itemId);
  }
}
