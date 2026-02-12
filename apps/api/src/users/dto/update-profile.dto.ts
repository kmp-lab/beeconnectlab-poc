import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  MaxLength,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  residence?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  activityStatus?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  interestRegions?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(200)
  desiredJob?: string;

  @IsOptional()
  @IsString()
  skills?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  profileImageUrl?: string;

  @IsOptional()
  @IsBoolean()
  marketingConsent?: boolean;
}
