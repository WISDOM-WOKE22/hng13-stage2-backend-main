import { IsOptional, IsString, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';

export class CountryQueryDto {
  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  @IsIn(['gdp_asc', 'gdp_desc', 'population_asc', 'population_desc', 'name_asc', 'name_desc'])
  sort?: string;
}
