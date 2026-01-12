import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
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

  async create(createMealDto: CreateMealDto, userId: string): Promise<Meal> {
    const meal = this.mealRepository.create({
      type: createMealDto.type,
      date: new Date(createMealDto.date),
      notes: createMealDto.notes,
      userId,
    });

    const savedMeal = await this.mealRepository.save(meal);

    if (createMealDto.items?.length) {
      for (const item of createMealDto.items) {
        await this.addItem(savedMeal.id, item, userId);
      }
    }

    return this.findOne(savedMeal.id, userId);
  }

  async findAll(userId: string): Promise<Meal[]> {
    return this.mealRepository.find({
      where: { userId },
      order: { date: 'DESC', createdAt: 'DESC' },
    });
  }

  async findByDate(date: string, userId: string): Promise<Meal[]> {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    return this.mealRepository.find({
      where: {
        userId,
        date: Between(startDate, endDate),
      },
      order: { createdAt: 'ASC' },
    });
  }

  async findByDateRange(startDate: string, endDate: string, userId: string): Promise<Meal[]> {
    return this.mealRepository.find({
      where: {
        userId,
        date: Between(new Date(startDate), new Date(endDate)),
      },
      order: { date: 'ASC', createdAt: 'ASC' },
    });
  }

  async findOne(id: string, userId?: string): Promise<Meal> {
    const meal = await this.mealRepository.findOne({
      where: { id },
      relations: ['items', 'items.food'],
    });
    if (!meal) {
      throw new NotFoundException(`Repas avec l'ID ${id} non trouvé`);
    }
    // Vérifier que le repas appartient à l'utilisateur
    if (userId && meal.userId && meal.userId !== userId) {
      throw new ForbiddenException('Vous n\'avez pas accès à ce repas');
    }
    return meal;
  }

  async update(id: string, updateMealDto: UpdateMealDto, userId: string): Promise<Meal> {
    const meal = await this.findOne(id, userId);

    if (updateMealDto.type) meal.type = updateMealDto.type;
    if (updateMealDto.date) meal.date = new Date(updateMealDto.date);
    if (updateMealDto.notes !== undefined) meal.notes = updateMealDto.notes;

    await this.mealRepository.save(meal);
    return this.findOne(id, userId);
  }

  async remove(id: string, userId: string): Promise<void> {
    const meal = await this.findOne(id, userId);
    await this.mealRepository.remove(meal);
  }

  async addItem(mealId: string, addItemDto: AddItemDto | CreateMealItemDto, userId: string): Promise<Meal> {
    const meal = await this.findOne(mealId, userId);
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
    return this.findOne(mealId, userId);
  }

  async removeItem(mealId: string, itemId: string, userId: string): Promise<Meal> {
    await this.findOne(mealId, userId);

    const item = await this.mealItemRepository.findOne({
      where: { id: itemId, mealId },
    });

    if (!item) {
      throw new NotFoundException(`Item avec l'ID ${itemId} non trouvé dans le repas ${mealId}`);
    }

    await this.mealItemRepository.remove(item);
    return this.findOne(mealId, userId);
  }

  async updateItem(mealId: string, itemId: string, quantity: number, userId: string): Promise<Meal> {
    await this.findOne(mealId, userId);

    const item = await this.mealItemRepository.findOne({
      where: { id: itemId, mealId },
      relations: ['food'],
    });

    if (!item) {
      throw new NotFoundException(`Item avec l'ID ${itemId} non trouvé dans le repas ${mealId}`);
    }

    // Recalculer les valeurs nutritionnelles
    const ratio = quantity / Number(item.food.servingSize);
    item.quantity = quantity;
    item.calories = Number(item.food.calories) * ratio;
    item.proteins = Number(item.food.proteins) * ratio;
    item.carbs = Number(item.food.carbs) * ratio;
    item.fats = Number(item.food.fats) * ratio;

    await this.mealItemRepository.save(item);
    return this.findOne(mealId, userId);
  }

  async getDailySummary(date: string, userId: string) {
    const meals = await this.findByDate(date, userId);

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
