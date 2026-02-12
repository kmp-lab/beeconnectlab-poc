import { IsEnum } from 'class-validator';
import { ApplicationStatus } from '@beeconnectlab/shared-types';

export class UpdateApplicationStatusDto {
  @IsEnum(ApplicationStatus)
  status: ApplicationStatus;
}
