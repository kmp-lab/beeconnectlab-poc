import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { ApplicationsService } from './applications.service';
import { UserGuard } from '../auth/guards/user.guard';
import { CreateApplicationDto } from './dto/create-application.dto';

@Controller('applications')
@UseGuards(UserGuard)
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  async create(@Body() dto: CreateApplicationDto, @Req() req: Request) {
    const user = (req as Request & { user: { id: string } }).user;
    return this.applicationsService.create(dto, user.id);
  }
}
