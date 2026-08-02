import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Difficulty, Language } from "../types/index.js";

export class GenerateProblemDto {
  @IsString()
  @IsNotEmpty()
  prompt!: string;

  @IsOptional()
  @IsEnum(Language)
  language?: Language;

  @IsOptional()
  @IsEnum(Difficulty)
  difficulty?: Difficulty;
}
