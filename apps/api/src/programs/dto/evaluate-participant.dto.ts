import {
  IsString,
  IsOptional,
  IsObject,
  IsInt,
  IsEnum,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { ParticipationStatus } from '@beeconnectlab/shared-types';

export class EvaluateParticipantDto {
  @IsObject()
  evalScores: Record<string, number>;

  @IsInt()
  @Min(0)
  @Max(100)
  evalTotalScore: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  role?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  evalComment?: string;

  @IsEnum(ParticipationStatus)
  participationStatus: ParticipationStatus;
}
