import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AppConfigService } from './shared/service/app-config.service';
import { z } from 'zod';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate: (config) => {
        const schema = z.object({
          PORT: z
            .string()
            .transform((val) => parseInt(val, 10))
            .refine((val) => !isNaN(val), {
              message: 'PORT must be a valid number',
            }) // Ensure it's a number
            .refine((val) => val > 0 && val <= 65535, {
              message: 'PORT must be between 1 and 65535',
            }),
          NODE_ENV: z.enum(['development', 'production', 'test']),
        });

        return schema.parse(config);
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService, AppConfigService],
})
export class AppModule {}
