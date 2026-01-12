import { IsUUID, IsNumber, Min } from 'class-validator';

export class AddItemDto {
  @IsUUID()
  foodId: string;

  @IsNumber()
  @Min(0)
  quantity: number;
}
