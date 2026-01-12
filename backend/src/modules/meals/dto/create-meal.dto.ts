import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsArray,
  ValidateNested,
  IsUUID,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MealType } from '../entities/meal.entity';

export class CreateMealItemDto {
  @IsUUID()
  foodId: string;

  @IsNumber()
  @Min(0)
  quantity: number;
}

export class CreateMealDto {
  @IsEnum(MealType)
  type: MealType;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMealItemDto)
  items?: CreateMealItemDto[];
}
