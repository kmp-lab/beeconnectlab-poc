import { IsString, MaxLength } from 'class-validator';

export class CreateInterviewDto {
  @IsString()
  @MaxLength(500)
  thumbnailUrl: string;

  @IsString()
  @MaxLength(300)
  title: string;

  @IsString()
  description: string;

  @IsString()
  @MaxLength(500)
  link: string;
}
