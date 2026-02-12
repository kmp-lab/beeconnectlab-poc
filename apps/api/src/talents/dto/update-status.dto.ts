import { IsEnum } from 'class-validator';
import { AccountStatus } from '@beeconnectlab/shared-types';

export class UpdateStatusDto {
  @IsEnum(AccountStatus)
  accountStatus: AccountStatus;
}
