import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CountriesModule } from './countries/countries.module';
import { StatusModule } from './status/status.module';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [CountriesModule, StatusModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
