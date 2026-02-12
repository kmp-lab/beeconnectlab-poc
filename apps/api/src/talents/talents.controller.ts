import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Query,
  Param,
  Body,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AdminGuard } from '../auth/guards/admin.guard';
import { TalentsService } from './talents.service';
import { ListTalentsQueryDto } from './dto/list-talents-query.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { UpdateTagsDto } from './dto/update-tags.dto';
import { CreateNoteDto } from './dto/create-note.dto';

@Controller('admin/talents')
@UseGuards(AdminGuard)
export class TalentsController {
  constructor(private readonly talentsService: TalentsService) {}

  @Get()
  async list(@Query() query: ListTalentsQueryDto) {
    return this.talentsService.findAll(query);
  }

  @Get('export')
  async exportExcel(@Query() query: ListTalentsQueryDto, @Res() res: Response) {
    const buffer = await this.talentsService.exportExcel(query);
    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="talents_${Date.now()}.xlsx"`,
    });
    res.send(buffer);
  }

  @Get('programs')
  async getPrograms() {
    return this.talentsService.getDistinctPrograms();
  }

  @Get(':id')
  async detail(@Param('id') id: string) {
    return this.talentsService.findById(id);
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.talentsService.updateStatus(id, dto.accountStatus);
  }

  @Patch(':id/tags')
  async updateTags(@Param('id') id: string, @Body() dto: UpdateTagsDto) {
    return this.talentsService.updateTags(
      id,
      dto.specialHistory,
      dto.managementRisk,
    );
  }

  @Post(':id/notes')
  async createNote(
    @Param('id') id: string,
    @Body() dto: CreateNoteDto,
    @Req() req: Request,
  ) {
    const admin = (req as Request & { user: { id: string } }).user;
    return this.talentsService.createNote(id, dto.content, admin.id);
  }

  @Get(':id/notes')
  async listNotes(@Param('id') id: string) {
    const notes = await this.talentsService.findNotes(id);
    return notes.map((n) => ({
      id: n.id,
      content: n.content,
      createdById: n.createdById,
      createdByName: n.createdBy?.name ?? '',
      createdAt: n.createdAt,
    }));
  }

  @Delete('notes/:noteId')
  async deleteNote(@Param('noteId') noteId: string) {
    return this.talentsService.deleteNote(noteId);
  }
}
