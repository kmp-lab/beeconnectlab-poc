import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Interview } from '../database/entities/interview.entity';
import { InterviewsService } from './interviews.service';
import { InterviewsController } from './interviews.controller';
import { PublicInterviewsController } from './public-interviews.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Interview])],
  providers: [InterviewsService],
  controllers: [InterviewsController, PublicInterviewsController],
  exports: [InterviewsService],
})
export class InterviewsModule {}
