import { Injectable } from "@nestjs/common";
import { Queue } from "bullmq";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class MetadataQueue {
    private queue: Queue;

    constructor(
        private config: ConfigService
    ){
        this.queue = new Queue('metadata', {
            connection: {
                host: this.config.get('REDIS_HOST') || 'localhost',
                port: Number(this.config.get('REDIS_PORT')) || 6379
            }
        });
    }

    async addFetchJob(appid: number){
        await this.queue.add('fetch-metadata', {appid});
        console.log('Adding metadata for app with id: ', appid);
    }
}