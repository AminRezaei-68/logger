import { Logger, Module } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { MongooseModule } from '@nestjs/mongoose';
import { LoggerSchema } from './schema/logger.schema';
import { LoggerController } from './logger.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Logger.name, schema: LoggerSchema }]),
  ],
  providers: [LoggerService],
  controllers: [LoggerController],
})
export class LoggerModule {}
