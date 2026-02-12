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
import { AdminApplicationsService } from './admin-applications.service';
import { ListApplicationsQueryDto } from './dto/list-applications-query.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';

@Controller('admin/applications')
@UseGuards(AdminGuard)
export class AdminApplicationsController {
  constructor(
    private readonly adminApplicationsService: AdminApplicationsService,
  ) {}

  @Get()
  async list(@Query() query: ListApplicationsQueryDto) {
    return this.adminApplicationsService.findAll(query);
  }

  @Get('export')
  async exportExcel(
    @Query() query: ListApplicationsQueryDto,
    @Res() res: Response,
  ) {
    const buffer = await this.adminApplicationsService.exportExcel(query);
    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="applications_${Date.now()}.xlsx"`,
    });
    res.send(buffer);
  }

  @Get('announcements')
  async getAnnouncements() {
    return this.adminApplicationsService.getDistinctAnnouncements();
  }

  @Get(':id')
  async detail(
    @Param('id') id: string,
    @Query() query: ListApplicationsQueryDto,
  ) {
    const detail = await this.adminApplicationsService.findById(id);
    const adjacent = await this.adminApplicationsService.getAdjacentIds(
      id,
      query,
    );
    return { ...detail, ...adjacent };
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateApplicationStatusDto,
    @Req() req: Request,
  ) {
    const admin = (req as Request & { user: { id: string } }).user;
    return this.adminApplicationsService.updateStatus(id, dto.status, admin.id);
  }

  @Post(':id/evaluations')
  async createEvaluation(
    @Param('id') id: string,
    @Body() dto: CreateEvaluationDto,
    @Req() req: Request,
  ) {
    const admin = (req as Request & { user: { id: string } }).user;
    return this.adminApplicationsService.createEvaluation(id, dto, admin.id);
  }

  @Get(':id/evaluations')
  async listEvaluations(@Param('id') id: string) {
    return this.adminApplicationsService.findEvaluations(id);
  }

  @Delete('evaluations/:evalId')
  async deleteEvaluation(@Param('evalId') evalId: string) {
    return this.adminApplicationsService.deleteEvaluation(evalId);
  }
}
