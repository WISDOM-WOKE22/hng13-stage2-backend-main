import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { CountriesService } from '../countries/countries.service';

@Controller('status')
export class StatusController {
  constructor(private readonly countriesService: CountriesService) {}

  @Get()
  async getStatus() {
    try {
      return await this.countriesService.getStatus();
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        { error: 'Internal server error' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
