import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(50)
  password: string;

  @IsString()
  @MaxLength(50)
  firstName: string;

  @IsString()
  @MaxLength(50)
  lastName: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  targetCalories?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  targetProteins?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  targetCarbs?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  targetFats?: number;
}
