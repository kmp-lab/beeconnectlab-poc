import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import { InterviewsService } from './interviews.service';
import { AdminGuard } from '../auth/guards/admin.guard';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { UpdateInterviewDto } from './dto/update-interview.dto';

@Controller('admin/contents')
@UseGuards(AdminGuard)
export class InterviewsController {
  constructor(private readonly interviewsService: InterviewsService) {}

  @Get()
  async list() {
    return this.interviewsService.findAll();
  }

  @Post()
  async create(@Body() dto: CreateInterviewDto, @Req() req: Request) {
    const admin = (req as Request & { user: { id: string } }).user;
    return this.interviewsService.create(dto, admin.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const interview = await this.interviewsService.findById(id);
    if (!interview) {
      throw new NotFoundException('Interview not found');
    }
    return interview;
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateInterviewDto) {
    return this.interviewsService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.interviewsService.remove(id);
    return { message: 'Interview deleted successfully' };
  }
}
