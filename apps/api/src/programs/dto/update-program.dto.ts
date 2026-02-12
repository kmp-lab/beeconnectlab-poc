import {
  IsString,
  IsDateString,
  IsOptional,
  IsArray,
  MaxLength,
} from 'class-validator';

export class UpdateProgramDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  host?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  organizer?: string;

  @IsOptional()
  @IsDateString()
  activityStartDate?: string;

  @IsOptional()
  @IsDateString()
  activityEndDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  regionSido?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  regionSigungu?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  benefits?: string[];
}
