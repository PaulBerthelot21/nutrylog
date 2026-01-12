import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Unique,
} from 'typeorm';

@Entity('foods')
@Unique(['name', 'brand']) // Évite les doublons name+brand
@Index(['barcode'], { unique: true, where: 'barcode IS NOT NULL' }) // Barcode unique si défini
export class Food {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  brand: string;

  @Column('decimal', { precision: 10, scale: 2 })
  calories: number;

  @Column('decimal', { precision: 10, scale: 2 })
  proteins: number;

  @Column('decimal', { precision: 10, scale: 2 })
  carbs: number;

  @Column('decimal', { precision: 10, scale: 2 })
  fats: number;

  @Column('decimal', { precision: 10, scale: 2, default: 100 })
  servingSize: number;

  @Column({ default: 'g' })
  servingUnit: string;

  @Column({ nullable: true })
  barcode: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
