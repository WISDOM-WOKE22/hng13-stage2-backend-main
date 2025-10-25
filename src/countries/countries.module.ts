import { Module } from '@nestjs/common';
import { CountriesService } from './countries.service';
import { CountriesController } from './countries.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [CountriesService, PrismaService],
  controllers: [CountriesController],
  exports: [CountriesService],
})
export class CountriesModule {}
