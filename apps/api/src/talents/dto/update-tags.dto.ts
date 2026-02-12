import { IsOptional, IsString } from 'class-validator';

export class UpdateTagsDto {
  @IsOptional()
  @IsString()
  specialHistory?: string | null;

  @IsOptional()
  @IsString()
  managementRisk?: string | null;
}
