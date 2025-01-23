import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: { host: 'localhost', port: 3001 },
  });
  await app.startAllMicroservices();
  const port = process.env.PORT || 3002;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}/api`);
}
bootstrap();
