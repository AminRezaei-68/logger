import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Logger } from './schema/logger.schema';
import { Model } from 'mongoose';
import { PaginationQueryDto } from './common/dtos/pagination_query.dto';

@Injectable()
export class LoggerService {
  constructor(
    @InjectModel(Logger.name) private readonly loggerModel: Model<Logger>,
  ) {}

  async saveLog(data: { email: string; action: string }): Promise<void> {
    const newLog = new this.loggerModel({ ...data });

    const savedLog = await newLog.save();
    console.log(`The user with email ${savedLog.email} ${savedLog.action}.`);
  }

  async findAll(paginationQueryDto: PaginationQueryDto): Promise<any> {
    const { limit = 10, offset = 0 } = paginationQueryDto;
    return this.loggerModel.find().skip(offset).limit(limit).exec();
  }
}
