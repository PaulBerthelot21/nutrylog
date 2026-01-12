import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FoodsModule } from './modules/foods/foods.module';
import { MealsModule } from './modules/meals/meals.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST', 'postgres'),
        port: configService.get<number>('DATABASE_PORT', 5432),
        username: configService.get('DATABASE_USER', 'nutrylog'),
        password: configService.get('DATABASE_PASSWORD', 'nutrylog'),
        database: configService.get('DATABASE_NAME', 'nutrylog'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('NODE_ENV') === 'development',
      }),
    }),
    FoodsModule,
    MealsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
