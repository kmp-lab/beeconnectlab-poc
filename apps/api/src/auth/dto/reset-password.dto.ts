import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class ResetPasswordRequestDto {
  @IsEmail()
  email: string;
}

export class ResetPasswordConfirmDto {
  @IsString()
  token: string;

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
  newPassword: string;
}
