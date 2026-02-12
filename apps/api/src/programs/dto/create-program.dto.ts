import {
  IsString,
  IsDateString,
  IsOptional,
  IsArray,
  MaxLength,
} from 'class-validator';

export class CreateProgramDto {
  @IsString()
  @MaxLength(200)
  name: string;

  @IsString()
  @MaxLength(200)
  host: string;

  @IsString()
  @MaxLength(200)
  organizer: string;

  @IsDateString()
  activityStartDate: string;

  @IsDateString()
  activityEndDate: string;

  @IsString()
  @MaxLength(50)
  regionSido: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  regionSigungu?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  benefits?: string[];
}
