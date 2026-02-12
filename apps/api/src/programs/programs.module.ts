import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Program } from '../database/entities/program.entity';
import { Announcement } from '../database/entities/announcement.entity';
import { ProgramsService } from './programs.service';
import { ProgramsController } from './programs.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Program, Announcement])],
  providers: [ProgramsService],
  controllers: [ProgramsController],
  exports: [ProgramsService],
})
export class ProgramsModule {}
