import { Controller, Get } from '@nestjs/common';
import { InterviewsService } from './interviews.service';

@Controller('interviews')
export class PublicInterviewsController {
  constructor(private readonly interviewsService: InterviewsService) {}

  @Get()
  async list() {
    return this.interviewsService.findPublished();
  }
}
