import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  MaxLength,
} from 'class-validator';

export class CreateFoodDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  brand?: string;

  @IsNumber()
  @Min(0)
  calories: number;

  @IsNumber()
  @Min(0)
  proteins: number;

  @IsNumber()
  @Min(0)
  carbs: number;

  @IsNumber()
  @Min(0)
  fats: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  servingSize?: number;

  @IsOptional()
  @IsString()
  servingUnit?: string;

  @IsOptional()
  @IsString()
  barcode?: string;
}
