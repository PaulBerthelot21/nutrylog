import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Meal } from './entities/meal.entity';
import { MealItem } from './entities/meal-item.entity';
import { CreateMealDto, CreateMealItemDto } from './dto/create-meal.dto';
import { UpdateMealDto } from './dto/update-meal.dto';
import { AddItemDto } from './dto/add-item.dto';
import { FoodsService } from '../foods/foods.service';

@Injectable()
export class MealsService {
  constructor(
    @InjectRepository(Meal)
    private readonly mealRepository: Repository<Meal>,
    @InjectRepository(MealItem)
    private readonly mealItemRepository: Repository<MealItem>,
    private readonly foodsService: FoodsService,
  ) {}

  async create(createMealDto: CreateMealDto): Promise<Meal> {
    const meal = this.mealRepository.create({
      type: createMealDto.type,
      date: new Date(createMealDto.date),
      notes: createMealDto.notes,
    });

    const savedMeal = await this.mealRepository.save(meal);

    if (createMealDto.items?.length) {
      for (const item of createMealDto.items) {
        await this.addItem(savedMeal.id, item);
      }
    }

    return this.findOne(savedMeal.id);
  }

  async findAll(): Promise<Meal[]> {
    return this.mealRepository.find({
      order: { date: 'DESC', createdAt: 'DESC' },
    });
  }

  async findByDate(date: string): Promise<Meal[]> {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    return this.mealRepository.find({
      where: {
        date: Between(startDate, endDate),
      },
      order: { createdAt: 'ASC' },
    });
  }

  async findByDateRange(startDate: string, endDate: string): Promise<Meal[]> {
    return this.mealRepository.find({
      where: {
        date: Between(new Date(startDate), new Date(endDate)),
      },
      order: { date: 'ASC', createdAt: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Meal> {
    const meal = await this.mealRepository.findOne({
      where: { id },
      relations: ['items', 'items.food'],
    });
    if (!meal) {
      throw new NotFoundException(`Meal with ID ${id} not found`);
    }
    return meal;
  }

  async update(id: string, updateMealDto: UpdateMealDto): Promise<Meal> {
    const meal = await this.findOne(id);

    if (updateMealDto.type) meal.type = updateMealDto.type;
    if (updateMealDto.date) meal.date = new Date(updateMealDto.date);
    if (updateMealDto.notes !== undefined) meal.notes = updateMealDto.notes;

    await this.mealRepository.save(meal);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const meal = await this.findOne(id);
    await this.mealRepository.remove(meal);
  }

  async addItem(mealId: string, addItemDto: AddItemDto | CreateMealItemDto): Promise<Meal> {
    const meal = await this.findOne(mealId);
    const food = await this.foodsService.findOne(addItemDto.foodId);

    // Calcul des valeurs nutritionnelles proportionnelles
    const ratio = addItemDto.quantity / food.servingSize;

    const mealItem = this.mealItemRepository.create({
      mealId: meal.id,
      foodId: food.id,
      quantity: addItemDto.quantity,
      calories: Number(food.calories) * ratio,
      proteins: Number(food.proteins) * ratio,
      carbs: Number(food.carbs) * ratio,
      fats: Number(food.fats) * ratio,
    });

    await this.mealItemRepository.save(mealItem);
    return this.findOne(mealId);
  }

  async removeItem(mealId: string, itemId: string): Promise<Meal> {
    await this.findOne(mealId);

    const item = await this.mealItemRepository.findOne({
      where: { id: itemId, mealId },
    });

    if (!item) {
      throw new NotFoundException(`Item with ID ${itemId} not found in meal ${mealId}`);
    }

    await this.mealItemRepository.remove(item);
    return this.findOne(mealId);
  }

  async getDailySummary(date: string) {
    const meals = await this.findByDate(date);

    const totals = meals.reduce(
      (acc, meal) => {
        const mealTotals = meal.items?.reduce(
          (itemAcc, item) => ({
            calories: itemAcc.calories + Number(item.calories),
            proteins: itemAcc.proteins + Number(item.proteins),
            carbs: itemAcc.carbs + Number(item.carbs),
            fats: itemAcc.fats + Number(item.fats),
          }),
          { calories: 0, proteins: 0, carbs: 0, fats: 0 },
        ) || { calories: 0, proteins: 0, carbs: 0, fats: 0 };

        return {
          calories: acc.calories + mealTotals.calories,
          proteins: acc.proteins + mealTotals.proteins,
          carbs: acc.carbs + mealTotals.carbs,
          fats: acc.fats + mealTotals.fats,
        };
      },
      { calories: 0, proteins: 0, carbs: 0, fats: 0 },
    );

    return {
      date,
      meals,
      totals,
    };
  }
}
