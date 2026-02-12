import {
  IsString,
  IsDateString,
  IsOptional,
  IsInt,
  IsEnum,
  MaxLength,
  Min,
} from 'class-validator';
import { PublishStatus, RecruitStatus } from '@beeconnectlab/shared-types';

export class UpdateAnnouncementDto {
  @IsOptional()
  @IsString()
  @MaxLength(300)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  jobType?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  thumbnailUrl?: string;

  @IsOptional()
  @IsString()
  detailContent?: string;

  @IsOptional()
  @IsEnum(PublishStatus)
  publishStatus?: PublishStatus;

  @IsOptional()
  @IsEnum(RecruitStatus)
  recruitStatus?: RecruitStatus;

  @IsOptional()
  @IsDateString()
  recruitStartDate?: string;

  @IsOptional()
  @IsDateString()
  recruitEndDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  scheduleResult?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  scheduleTraining?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  scheduleOnsite?: string;
}
