import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import { ProgramsService } from './programs.service';
import { AdminGuard } from '../auth/guards/admin.guard';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';
import { EvaluateParticipantDto } from './dto/evaluate-participant.dto';

@Controller('admin/programs')
@UseGuards(AdminGuard)
export class ProgramsController {
  constructor(private readonly programsService: ProgramsService) {}

  @Get()
  async list() {
    return this.programsService.findAll();
  }

  @Post()
  async create(@Body() dto: CreateProgramDto, @Req() req: Request) {
    const admin = (req as Request & { user: { id: string } }).user;
    return this.programsService.create(dto, admin.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const program = await this.programsService.findById(id);
    if (!program) {
      throw new NotFoundException('Program not found');
    }
    return program;
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateProgramDto) {
    return this.programsService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.programsService.remove(id);
    return { message: 'Program deleted successfully' };
  }

  @Get(':id/participants')
  async listParticipants(@Param('id') id: string) {
    return this.programsService.findParticipants(id);
  }

  @Put(':id/participants/:userId/evaluate')
  async evaluateParticipant(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body() dto: EvaluateParticipantDto,
    @Req() req: Request,
  ) {
    const admin = (req as Request & { user: { id: string } }).user;
    return this.programsService.evaluateParticipant(id, userId, dto, admin.id);
  }
}
