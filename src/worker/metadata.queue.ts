import { Injectable, OnModuleInit } from '@nestjs/common';
import { Queue } from 'bullmq';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MetadataQueue implements OnModuleInit{
    private queue: Queue;

    constructor(
        private config: ConfigService
    ){}

    onModuleInit() {
        this.queue = new Queue('metadata', {
            connection: {
                host: this.config.get('REDIS_HOST') || 'localhost',
                port: Number(this.config.get('REDIS_PORT')) || 6379
            }
        });
    }

    async addFetchJob(appid: number){
        const jobId = `appid-${appid}`;
        await this.queue.add('fetch-metadata', {appid}, {jobId: jobId});
        // console.log('Adding metadata for app with id: ', appid);
    }
}