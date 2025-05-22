import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { SearchModule } from './search/search.module';

@Module({
  imports: [
    RouterModule.register([
      {
        path: 'api',
        children: [
          {
            path: 'v1/search',
            module: SearchModule,
          },
        ],
      },
    ]),
    SearchModule,
  ],
  providers: [],
})
export class ApiRoutesModule {}
