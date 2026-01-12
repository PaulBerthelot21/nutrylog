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
  UseGuards,
  Request,
} from '@nestjs/common';
import { MealsService } from './meals.service';
import { CreateMealDto } from './dto/create-meal.dto';
import { UpdateMealDto } from './dto/update-meal.dto';
import { AddItemDto } from './dto/add-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('meals')
@UseGuards(JwtAuthGuard)
export class MealsController {
  constructor(private readonly mealsService: MealsService) {}

  @Post()
  create(@Body() createMealDto: CreateMealDto, @Request() req) {
    return this.mealsService.create(createMealDto, req.user.id);
  }

  @Get()
  findAll(@Request() req) {
    return this.mealsService.findAll(req.user.id);
  }

  @Get('date/:date')
  findByDate(@Param('date') date: string, @Request() req) {
    return this.mealsService.findByDate(date, req.user.id);
  }

  @Get('range')
  findByDateRange(
    @Query('start') startDate: string,
    @Query('end') endDate: string,
    @Request() req,
  ) {
    return this.mealsService.findByDateRange(startDate, endDate, req.user.id);
  }

  @Get('summary/:date')
  getDailySummary(@Param('date') date: string, @Request() req) {
    return this.mealsService.getDailySummary(date, req.user.id);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.mealsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMealDto: UpdateMealDto,
    @Request() req,
  ) {
    return this.mealsService.update(id, updateMealDto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.mealsService.remove(id, req.user.id);
  }

  @Post(':id/items')
  addItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() addItemDto: AddItemDto,
    @Request() req,
  ) {
    return this.mealsService.addItem(id, addItemDto, req.user.id);
  }

  @Delete(':id/items/:itemId')
  removeItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Request() req,
  ) {
    return this.mealsService.removeItem(id, itemId, req.user.id);
  }
}
