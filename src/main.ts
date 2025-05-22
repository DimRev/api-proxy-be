import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 49069);
}

console.log(
  `Starting API proxy server on http://localhost:${process.env.PORT ?? 49069}`,
);

void bootstrap();
