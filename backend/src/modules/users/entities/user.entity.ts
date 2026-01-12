import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Meal } from '../../meals/entities/meal.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  targetCalories: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  targetProteins: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  targetCarbs: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  targetFats: number;

  @OneToMany(() => Meal, (meal) => meal.user)
  meals: Meal[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
