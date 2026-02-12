import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../database/entities/user.entity';
import { UserNote } from '../database/entities/user-note.entity';
import { Application } from '../database/entities/application.entity';
import { Activity } from '../database/entities/activity.entity';
import { TalentsController } from './talents.controller';
import { TalentsService } from './talents.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserNote, Application, Activity])],
  controllers: [TalentsController],
  providers: [TalentsService],
})
export class TalentsModule {}
