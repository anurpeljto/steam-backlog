import { Module } from '@nestjs/common';
import { WorkerService } from './worker.service';
import { HttpModule } from '@nestjs/axios';

@Module({
    exports: [WorkerService],
    providers: [WorkerService],
    imports: [HttpModule]
})
export class WorkerModule {}
