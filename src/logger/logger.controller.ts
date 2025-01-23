import { Controller, Get } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { PaginationQueryDto } from './common/dtos/pagination_query.dto';
import { EventPattern } from '@nestjs/microservices';

@Controller('logger')
export class LoggerController {
  constructor(private readonly loggerService: LoggerService) {}

  @EventPattern('log')
  handelActionLog(data: any) {
    console.log('hit the controller in logger.');
    console.log('the data:', data);
    this.loggerService.saveLog(data);
  }

  @Get()
  async findAll(paginationQueryDto: PaginationQueryDto) {
    return this.loggerService.findAll(paginationQueryDto);
  }
}
