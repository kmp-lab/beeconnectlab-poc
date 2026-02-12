import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Application } from '../database/entities/application.entity';
import { ApplicationEvaluation } from '../database/entities/application-evaluation.entity';
import { ApplicationStatusLog } from '../database/entities/application-status-log.entity';
import { Activity } from '../database/entities/activity.entity';
import { Announcement } from '../database/entities/announcement.entity';
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';
import { AdminApplicationsService } from './admin-applications.service';
import { AdminApplicationsController } from './admin-applications.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Application,
      ApplicationEvaluation,
      ApplicationStatusLog,
      Activity,
      Announcement,
    ]),
  ],
  providers: [ApplicationsService, AdminApplicationsService],
  controllers: [ApplicationsController, AdminApplicationsController],
  exports: [ApplicationsService],
})
export class ApplicationsModule {}
