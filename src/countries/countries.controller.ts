import { 
  Controller, 
  Get, 
  Post, 
  Delete, 
  Param, 
  Query, 
  Res, 
  HttpException, 
  HttpStatus,
  ValidationPipe,
  UsePipes
} from '@nestjs/common';
import { CountriesService } from './countries.service';
import { CountryQueryDto } from './dto/query.dto';
import type { Response } from 'express';

@Controller('countries')
export class CountriesController {
  constructor(private readonly countriesService: CountriesService) {}

  @Post('refresh')
  async refreshCountries() {
    try {
      return await this.countriesService.refreshCountries();
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

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  async findAll(@Query() query: CountryQueryDto) {
    try {
      return await this.countriesService.findAll(query);
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

  @Get('image')
  async getSummaryImage(@Res() res: Response) {
    try {
      const imageBuffer = await this.countriesService.getSummaryImage();
      res.set({
        'Content-Type': 'image/png',
        'Content-Length': imageBuffer.length.toString(),
      });
      res.send(imageBuffer);
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

  @Get(':name')
  async findOne(@Param('name') name: string) {
    try {
      return await this.countriesService.findOne(name);
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

  @Delete(':name')
  async remove(@Param('name') name: string) {
    try {
      return await this.countriesService.remove(name);
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
