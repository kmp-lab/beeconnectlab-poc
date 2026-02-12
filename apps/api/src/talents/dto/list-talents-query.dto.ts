import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ListTalentsQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  activityStatus?: string;

  @IsOptional()
  @IsString()
  specialHistory?: string;

  @IsOptional()
  @IsString()
  managementRisk?: string;

  @IsOptional()
  @IsString()
  recentProgram?: string;

  @IsOptional()
  @IsString()
  accountStatus?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;
}
