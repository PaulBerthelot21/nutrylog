import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MealsService } from './meals.service';
import { MealsController } from './meals.controller';
import { Meal } from './entities/meal.entity';
import { MealItem } from './entities/meal-item.entity';
import { FoodsModule } from '../foods/foods.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Meal, MealItem]),
    FoodsModule,
  ],
  controllers: [MealsController],
  providers: [MealsService],
  exports: [MealsService],
})
export class MealsModule {}
