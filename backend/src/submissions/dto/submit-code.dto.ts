import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { Language } from "../../ai/types/index.js";

class TestCaseDto {
  @IsString()
  @IsNotEmpty()
  input!: string;

  @IsString()
  @IsNotEmpty()
  stdin!: string;

  @IsString()
  @IsNotEmpty()
  expectedOutput!: string;
}

export class SubmitCodeDto {
  @IsString()
  @IsNotEmpty()
  userCode!: string;

  @IsString()
  @IsNotEmpty()
  driverCode!: string;

  @IsEnum(Language)
  language!: Language;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TestCaseDto)
  visibleTestCases!: TestCaseDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TestCaseDto)
  hiddenTestCases!: TestCaseDto[];
}
