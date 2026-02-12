import {
  IsString,
  IsOptional,
  IsUUID,
  IsEmail,
  MaxLength,
} from 'class-validator';

export class CreateApplicationDto {
  @IsUUID()
  announcementId: string;

  @IsString()
  @MaxLength(50)
  applicantName: string;

  @IsEmail()
  @MaxLength(255)
  applicantEmail: string;

  @IsString()
  @MaxLength(20)
  applicantPhone: string;

  @IsString()
  @MaxLength(500)
  fileUrl1: string;

  @IsString()
  @MaxLength(255)
  fileName1: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  fileUrl2?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  fileName2?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  referralSource?: string;
}
