import {
  IsString,
  IsDateString,
  IsOptional,
  IsInt,
  IsEnum,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { PublishStatus } from '@beeconnectlab/shared-types';

export class CreateAnnouncementDto {
  @IsUUID()
  programId: string;

  @IsString()
  @MaxLength(300)
  name: string;

  @IsString()
  @MaxLength(100)
  jobType: string;

  @IsInt()
  @Min(1)
  capacity: number;

  @IsString()
  @MaxLength(500)
  thumbnailUrl: string;

  @IsString()
  detailContent: string;

  @IsOptional()
  @IsEnum(PublishStatus)
  publishStatus?: PublishStatus;

  @IsDateString()
  recruitStartDate: string;

  @IsDateString()
  recruitEndDate: string;

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
