import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateCountryDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  capital?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsNumber()
  population: number;

  @IsOptional()
  @IsString()
  currency_code?: string | null;

  @IsOptional()
  @IsNumber()
  exchange_rate?: number | null;

  @IsOptional()
  @IsNumber()
  estimated_gdp?: number | null;

  @IsOptional()
  @IsString()
  flag_url?: string;
}

export class UpdateCountryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  capital?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsNumber()
  population?: number;

  @IsOptional()
  @IsString()
  currency_code?: string | null;

  @IsOptional()
  @IsNumber()
  exchange_rate?: number | null;

  @IsOptional()
  @IsNumber()
  estimated_gdp?: number | null;

  @IsOptional()
  @IsString()
  flag_url?: string;
}

export class CountryResponseDto {
  id: number;
  name: string;
  capital?: string | null;
  region?: string | null;
  population: number;
  currency_code?: string | null;
  exchange_rate?: number | null;
  estimated_gdp?: number | null;
  flag_url?: string | null;
  last_refreshed_at: Date;
}

export class StatusResponseDto {
  total_countries: number;
  last_refreshed_at: Date;
}

export class ErrorResponseDto {
  error: string;
  details?: any;
}