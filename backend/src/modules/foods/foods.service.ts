import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, IsNull } from 'typeorm';
import { Food } from './entities/food.entity';
import { CreateFoodDto } from './dto/create-food.dto';
import { UpdateFoodDto } from './dto/update-food.dto';

@Injectable()
export class FoodsService {
  constructor(
    @InjectRepository(Food)
    private readonly foodRepository: Repository<Food>,
  ) {}

  async create(createFoodDto: CreateFoodDto): Promise<Food> {
    // Vérifier si l'aliment existe déjà
    const existing = await this.findByNameAndBrand(
      createFoodDto.name,
      createFoodDto.brand,
    );
    if (existing) {
      throw new ConflictException(
        `L'aliment "${createFoodDto.name}" (${createFoodDto.brand || 'sans marque'}) existe déjà`,
      );
    }

    const food = this.foodRepository.create(createFoodDto);
    return this.foodRepository.save(food);
  }

  async findOrCreate(createFoodDto: CreateFoodDto): Promise<{ food: Food; created: boolean }> {
    const existing = await this.findByNameAndBrand(
      createFoodDto.name,
      createFoodDto.brand,
    );
    if (existing) {
      return { food: existing, created: false };
    }

    const food = this.foodRepository.create(createFoodDto);
    const savedFood = await this.foodRepository.save(food);
    return { food: savedFood, created: true };
  }

  async findByNameAndBrand(name: string, brand?: string): Promise<Food | null> {
    return this.foodRepository.findOne({
      where: { name, brand: brand ? brand : IsNull() },
    });
  }

  async findAll(search?: string): Promise<Food[]> {
    if (search) {
      return this.foodRepository.find({
        where: [
          { name: Like(`%${search}%`) },
          { brand: Like(`%${search}%`) },
        ],
        order: { name: 'ASC' },
      });
    }
    return this.foodRepository.find({ order: { name: 'ASC' } });
  }

  async findOne(id: string): Promise<Food> {
    const food = await this.foodRepository.findOne({ where: { id } });
    if (!food) {
      throw new NotFoundException(`Food with ID ${id} not found`);
    }
    return food;
  }

  async findByBarcode(barcode: string): Promise<Food | null> {
    return this.foodRepository.findOne({ where: { barcode } });
  }

  async update(id: string, updateFoodDto: UpdateFoodDto): Promise<Food> {
    const food = await this.findOne(id);
    Object.assign(food, updateFoodDto);
    return this.foodRepository.save(food);
  }

  async remove(id: string): Promise<void> {
    const food = await this.findOne(id);
    await this.foodRepository.remove(food);
  }
}
