import { Module } from '@nestjs/common';
import { ApiRoutesModule } from './api-routes.module';

@Module({
  imports: [ApiRoutesModule],
})
export class ApiModule {}
