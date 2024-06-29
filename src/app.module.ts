import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AgoraService } from './services/agora.service';

import configuration from '../config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecordingService } from './services/record.service';
import { FileService } from './services/file.service';
import { Recording } from './entities/recording.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      cache: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) =>
        configService.get('database'),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Recording])
  ],
  controllers: [AppController],
  providers: [AgoraService,RecordingService,FileService],
})
export class AppModule {}
