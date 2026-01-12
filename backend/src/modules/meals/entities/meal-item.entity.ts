import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Meal } from './meal.entity';
import { Food } from '../../foods/entities/food.entity';

@Entity('meal_items')
export class MealItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Meal, (meal) => meal.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'meal_id' })
  meal: Meal;

  @Column({ name: 'meal_id' })
  mealId: string;

  @ManyToOne(() => Food, { eager: true })
  @JoinColumn({ name: 'food_id' })
  food: Food;

  @Column({ name: 'food_id' })
  foodId: string;

  @Column('decimal', { precision: 10, scale: 2 })
  quantity: number;

  // Valeurs nutritionnelles calculées au moment de l'ajout
  @Column('decimal', { precision: 10, scale: 2 })
  calories: number;

  @Column('decimal', { precision: 10, scale: 2 })
  proteins: number;

  @Column('decimal', { precision: 10, scale: 2 })
  carbs: number;

  @Column('decimal', { precision: 10, scale: 2 })
  fats: number;
}
