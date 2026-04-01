import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  emailId: string;

  @IsString()
  password: string;

  @IsString()
  @IsOptional()
  name?: string;
}
