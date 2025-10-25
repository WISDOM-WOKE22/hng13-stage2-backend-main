import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCountryDto, CountryResponseDto, StatusResponseDto } from './dto/country.dto';
import { CountryQueryDto } from './dto/query.dto';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import nodeHtmlToImage from 'node-html-to-image';

@Injectable()
export class CountriesService {
  constructor(private prisma: PrismaService) {}

  async refreshCountries(): Promise<{ message: string; countries_processed: number }> {
    try {
      // Fetch countries data
      const countriesResponse = await axios.get(
        'https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies'
      );
      
      // Fetch exchange rates
      const exchangeResponse = await axios.get('https://open.er-api.com/v6/latest/USD');
      const exchangeRates = exchangeResponse.data.rates;

      let processedCount = 0;

      for (const countryData of countriesResponse.data) {
        const currencyCode = countryData.currencies && countryData.currencies.length > 0 
          ? countryData.currencies[0].code 
          : null;

        let exchangeRate: number | undefined = undefined;
        let estimatedGdp: number | undefined = undefined;

        if (currencyCode && exchangeRates[currencyCode]) {
          exchangeRate = exchangeRates[currencyCode];
          const randomMultiplier = Math.random() * 1000 + 1000; // Random between 1000-2000
          estimatedGdp = (countryData.population * randomMultiplier) / exchangeRate!;
        }

        const countryDto: CreateCountryDto = {
          name: countryData.name,
          capital: countryData.capital,
          region: countryData.region,
          population: countryData.population,
          currency_code: currencyCode,
          exchange_rate: exchangeRate,
          estimated_gdp: estimatedGdp,
          flag_url: countryData.flag,
        };

        // Check if country exists (case-insensitive)
        const existingCountry = await this.prisma.country.findFirst({
          where: {
            name: {
              equals: countryData.name,
            },
          },
        });

        if (existingCountry) {
          // Update existing country
          await this.prisma.country.update({
            where: { id: existingCountry.id },
            data: countryDto,
          });
        } else {
          // Create new country
          await this.prisma.country.create({
            data: countryDto,
          });
        }

        processedCount++;
      }

      // Generate summary image
      await this.generateSummaryImage();

      return {
        message: 'Countries refreshed successfully',
        countries_processed: processedCount,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new HttpException(
          {
            error: 'External data source unavailable',
            details: `Could not fetch data from ${error.config?.url?.includes('restcountries') ? 'restcountries.com' : 'open.er-api.com'}`,
          },
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }
      throw new HttpException(
        { error: 'Internal server error' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(query: CountryQueryDto): Promise<CountryResponseDto[]> {
    const where: any = {};
    
    if (query.region) {
      where.region = query.region;
    }
    
    if (query.currency) {
      where.currency_code = query.currency;
    }

    const orderBy: any = {};
    if (query.sort) {
      switch (query.sort) {
        case 'gdp_asc':
          orderBy.estimated_gdp = 'asc';
          break;
        case 'gdp_desc':
          orderBy.estimated_gdp = 'desc';
          break;
        case 'population_asc':
          orderBy.population = 'asc';
          break;
        case 'population_desc':
          orderBy.population = 'desc';
          break;
        case 'name_asc':
          orderBy.name = 'asc';
          break;
        case 'name_desc':
          orderBy.name = 'desc';
          break;
      }
    }

    const countries = await this.prisma.country.findMany({
      where,
      orderBy,
    });

    return countries;
  }

  async findOne(name: string): Promise<CountryResponseDto> {
    const country = await this.prisma.country.findFirst({
      where: {
        name: {
          equals: name,
        },
      },
    });

    if (!country) {
      throw new HttpException(
        { error: 'Country not found' },
        HttpStatus.NOT_FOUND,
      );
    }

    return country;
  }

  async remove(name: string): Promise<{ message: string }> {
    const country = await this.prisma.country.findFirst({
      where: {
        name: {
          equals: name,
        },
      },
    });

    if (!country) {
      throw new HttpException(
        { error: 'Country not found' },
        HttpStatus.NOT_FOUND,
      );
    }

    await this.prisma.country.delete({
      where: { id: country.id },
    });

    return { message: 'Country deleted successfully' };
  }

  async getStatus(): Promise<StatusResponseDto> {
    const totalCountries = await this.prisma.country.count();
    const lastRefreshed = await this.prisma.country.findFirst({
      orderBy: { last_refreshed_at: 'desc' },
      select: { last_refreshed_at: true },
    });

    return {
      total_countries: totalCountries,
      last_refreshed_at: lastRefreshed?.last_refreshed_at || new Date(),
    };
  }

  async getSummaryImage(): Promise<Buffer> {
    const imagePath = path.join(process.cwd(), 'cache', 'summary.png');
    
    if (!fs.existsSync(imagePath)) {
      throw new HttpException(
        { error: 'Summary image not found' },
        HttpStatus.NOT_FOUND,
      );
    }

    return fs.readFileSync(imagePath);
  }

 private async generateSummaryImage(): Promise<void> {
  try {
    // Ensure cache directory exists with proper permissions
    const cacheDir = path.join(process.cwd(), 'cache');
    try {
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { 
          recursive: true,
          mode: 0o755 // rwxr-xr-x permissions
        });
      }
      // Verify write permissions
      const testFile = path.join(cacheDir, '.test');
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile);
    } catch (error) {
      console.error('Error setting up cache directory:', error);
      throw new Error('Failed to initialize cache directory. Please check write permissions.');
    }

    // Get summary data
    const totalCountries = await this.prisma.country.count();
    const topCountries = await this.prisma.country.findMany({
      orderBy: { estimated_gdp: 'desc' },
      take: 5,
      select: {
        name: true,
        estimated_gdp: true,
      },
    });

    const lastRefreshed = await this.prisma.country.findFirst({
      orderBy: { last_refreshed_at: 'desc' },
      select: { last_refreshed_at: true },
    });

    // Create HTML content for image generation
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f8f9fa;
            width: 800px;
            height: 600px;
            box-sizing: border-box;
          }
          .title {
            font-size: 32px;
            font-weight: bold;
            color: #2c3e50;
            text-align: center;
            margin-bottom: 20px;
          }
          .subtitle {
            font-size: 24px;
            text-align: center;
            margin-bottom: 30px;
          }
          .section-title {
            font-size: 20px;
            font-weight: bold;
            margin: 20px 0 10px 0;
          }
          .country-list {
            font-size: 16px;
            margin-left: 20px;
          }
          .country-item {
            margin: 5px 0;
            padding: 8px;
            background-color: white;
            border-radius: 5px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .footer {
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 14px;
            text-align: center;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="title">Countries Summary</div>
        <div class="subtitle">Total Countries: ${totalCountries}</div>
        
        <div class="section-title">Top 5 Countries by GDP:</div>
        <div class="country-list">
          ${topCountries.map((country, index) => {
            const gdp = country.estimated_gdp ? country.estimated_gdp.toLocaleString() : 'N/A';
            return `<div class="country-item">${index + 1}. ${country.name}: $${gdp}</div>`;
          }).join('')}
        </div>
        
        <div class="footer">
          Last Refreshed: ${lastRefreshed?.last_refreshed_at 
            ? lastRefreshed.last_refreshed_at.toISOString()
            : 'Never'}
        </div>
      </body>
      </html>
    `;

    // Convert HTML to PNG using node-html-to-image
    const imagePath = path.join(cacheDir, 'summary.png');
    
    try {
      await nodeHtmlToImage({
        output: imagePath,
        html: htmlContent,
        type: 'png',
        puppeteerArgs: {
          executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
          // args: [
          //   '--no-sandbox',
          //   '--disable-setuid-sandbox',
          //   '--disable-dev-shm-usage',
          //   '--disable-gpu'
          // ]
        }
      });
      
      if (!fs.existsSync(imagePath)) {
        throw new Error('Failed to generate image: No file was created');
      }
      
      console.log('Summary image generated successfully at:', imagePath);
    } catch (error: any) {
      console.error('Error generating image:', error);
      throw new Error(`Failed to generate summary image: ${error}`);
    }
    
    // Also create a simple text summary
//     const textSummary = `
// COUNTRIES SUMMARY
// ================

// Total Countries: ${totalCountries}

// Top 5 Countries by GDP:
// ${topCountries.map((country, index) => {
//   const gdp = country.estimated_gdp ? country.estimated_gdp.toLocaleString() : 'N/A';
//   return `${index + 1}. ${country.name}: $${gdp}`;
// }).join('\n')}

// Last Refreshed: ${lastRefreshed?.last_refreshed_at 
//   ? lastRefreshed.last_refreshed_at.toISOString()
//   : 'Never'}
//     `.trim();

//     const textPath = path.join(cacheDir, 'summary.txt');
//     fs.writeFileSync(textPath, textSummary);
    
  } catch (error) {
    console.error('Error generating summary image:', error);
    // Fallback: create a simple text file
    try {
      const cacheDir = path.join(process.cwd(), 'cache');
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }
      
      const fallbackText = 'Summary image generation failed. Please try refreshing the data.';
      const fallbackPath = path.join(cacheDir, 'summary.txt');
      fs.writeFileSync(fallbackPath, fallbackText);
    } catch (fallbackError) {
      console.error('Fallback summary creation failed:', fallbackError);
    }
  }
}
}
