import { UserRole } from "@prisma/client";
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from "class-validator";

import {
  USERNAME_PATTERN,
  USERNAME_PATTERN_DESCRIPTION,
} from "../user.constants";

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @Matches(USERNAME_PATTERN, { message: USERNAME_PATTERN_DESCRIPTION })
  username!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  displayName?: string;

  @ValidateIf((_, value) => value !== undefined && value !== "")
  @IsEmail()
  @MaxLength(180)
  email?: string;

  @IsEnum(UserRole)
  role!: UserRole;
}
