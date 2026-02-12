import {
  IsString,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsDateString,
  MaxLength,
  IsArray,
} from 'class-validator';
import { AuthProvider, Gender } from '@beeconnectlab/shared-types';

export class SocialRegisterDto {
  @IsString()
  accessToken: string;

  @IsEnum(AuthProvider)
  provider: AuthProvider;

  @IsString()
  @MaxLength(50)
  name: string;

  @IsString()
  @MaxLength(20)
  phone: string;

  @IsDateString()
  birthDate: string;

  @IsEnum(Gender)
  gender: Gender;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  residence?: string;

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

  @IsBoolean()
  termsAccepted: boolean;

  @IsBoolean()
  @IsOptional()
  marketingConsent?: boolean;
}
