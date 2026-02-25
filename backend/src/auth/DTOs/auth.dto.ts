import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsInt, IsOptional, IsString } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Juan Perez' })
  @IsString()
  nombre!: string;

  @ApiPropertyOptional({ example: 'juanp' })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({ example: 'juan@example.com' })
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({ example: '+54 11 5555-1234' })
  @IsOptional()
  @IsString()
  telefono?: string;

  @ApiProperty({ example: 'P4ssw0rd!' })
  @IsString()
  password!: string;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  id_rol?: number;
}

export class LoginDto {
  @ApiProperty({ example: 'juan@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'P4ssw0rd!' })
  @IsString()
  password!: string;
}

export class GoogleRegisterDto {
  @ApiProperty({ example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6Ij...google-id-token...' })
  @IsString()
  idToken!: string;

  @ApiPropertyOptional({ example: 'Juan Perez' })
  @IsOptional()
  @IsString()
  nombre?: string;

  @ApiPropertyOptional({ example: 'juanp' })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({ example: 'juan@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+54 11 5555-1234' })
  @IsOptional()
  @IsString()
  telefono?: string;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  id_rol?: number;
}

export class GoogleLoginDto {
  @ApiProperty({ example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6Ij...google-id-token...' })
  @IsString()
  idToken!: string;
}
