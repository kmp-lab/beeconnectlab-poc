import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'beeconnect'),
        password: configService.get('DB_PASSWORD', 'beeconnect'),
        database: configService.get('DB_DATABASE', 'beeconnectlab'),
        entities: [__dirname + '/database/entities/*.entity.{ts,js}'],
        synchronize: false,
        logging: configService.get('DB_LOGGING', 'false') === 'true',
      }),
    }),
    AuthModule,
  ],
})
export class AppModule {}
