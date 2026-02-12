import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  IsOptional,
} from 'class-validator';

export class AdminRegisterDto {
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

  @IsOptional()
  @IsString()
  @MaxLength(100)
  organization?: string;
}
