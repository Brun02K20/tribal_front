import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CorreoArgentinoAuthResponseDto {
    @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyQGV4YW1wbGUuY29tIiwiaWF0IjoxNjg4ODg5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c' })
    @IsString()
    token!: string;

    @ApiProperty({ example: '2024-07-01T12:00:00.000Z' })
    @IsString()
    expires!: string;
}

export class CorreoArgentinoValidateUserRequestDto {
    @ApiProperty({ example: 'bvirinni@gmail.com' })
    @IsString()
    email!: string;

    @ApiProperty({ example: 'password123' })
    @IsString()
    password!: string;
}

export class CorreoArgentinoValidateUserResponseDto {
    @ApiProperty({ example: "0900000234" })
    @IsString()
    customerId!: string;

    @ApiProperty({ example: '2024-07-01T12:00:00.000Z' })
    @IsString()
    createdAt!: string;

    @ApiProperty({ example: 'token' })
    @IsString()
    token!: string;
}