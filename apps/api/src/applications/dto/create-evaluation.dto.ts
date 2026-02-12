import {
  IsInt,
  Min,
  Max,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateEvaluationDto {
  @IsInt()
  @Min(0)
  @Max(100)
  scoreCriteria1: number;

  @IsInt()
  @Min(0)
  @Max(100)
  scoreCriteria2: number;

  @IsInt()
  @Min(0)
  @Max(100)
  scoreCriteria3: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  memo?: string;
}
