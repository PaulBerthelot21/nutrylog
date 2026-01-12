import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { MealItem } from './meal-item.entity';
import { User } from '../../users/entities/user.entity';

export enum MealType {
  BREAKFAST = 'breakfast',
  LUNCH = 'lunch',
  DINNER = 'dinner',
  SNACK = 'snack',
}

@Entity('meals')
export class Meal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.meals, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @Column({
    type: 'enum',
    enum: MealType,
    default: MealType.LUNCH,
  })
  type: MealType;

  @Column({ type: 'date' })
  date: Date;

  @Column({ nullable: true })
  notes: string;

  @OneToMany(() => MealItem, (mealItem) => mealItem.meal, {
    cascade: true,
    eager: true,
  })
  items: MealItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Propriétés calculées
  get totalCalories(): number {
    return this.items?.reduce((sum, item) => sum + item.calories, 0) || 0;
  }

  get totalProteins(): number {
    return this.items?.reduce((sum, item) => sum + item.proteins, 0) || 0;
  }

  get totalCarbs(): number {
    return this.items?.reduce((sum, item) => sum + item.carbs, 0) || 0;
  }

  get totalFats(): number {
    return this.items?.reduce((sum, item) => sum + item.fats, 0) || 0;
  }
}
