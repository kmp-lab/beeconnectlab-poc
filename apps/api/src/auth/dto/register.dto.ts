import {
  IsEmail,
  IsString,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsDateString,
  Matches,
  MaxLength,
  MinLength,
  IsArray,
} from 'class-validator';
import { Gender } from '@beeconnectlab/shared-types';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(16)
  @Matches(
    /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,16}$/,
    {
      message:
        'Password must be 8-16 characters with letters, numbers, and special characters',
    },
  )
  password: string;

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
