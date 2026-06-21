import { UserRole } from "@prisma/client";
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from "class-validator";

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  displayName?: string;

  @ValidateIf((_, value) => value !== undefined && value !== "")
  @IsEmail()
  @MaxLength(180)
  email?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
