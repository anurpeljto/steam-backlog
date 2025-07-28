import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import axios from "axios";
import { Worker } from "bullmq";
import { GameMetadata } from "src/entities/game_metadata.entity";
import { Repository } from "typeorm";


@Injectable()
export class MetadataWorker implements OnModuleInit{
    private worker: Worker;

    constructor(
        private config: ConfigService,
        @InjectRepository(GameMetadata) private metadataRepo: Repository<GameMetadata>
    ){}

    onModuleInit() {
        this.worker = new Worker(
            'metadata',
            async job => {
                const {appid} = job.data;
                console.log(`fetching metadata for appid ${appid}`)

                const { data } = await axios.get(`https://store.steampowered.com/api/appdetails`, {
                    params: { appids: appid }
                });

                const appData = data[appid]?.data;
                if(!appData)return;

                await this.metadataRepo.save({
                    appid,
                    name: appData.name,
                    genres: appData.genres?.map(genre => genre.description),
                    categories: appData.categories?.map(category => category.description),
                    tags: [],
                    last_fetched: new Date(),
                    header_image: appData.header_image
                });

                console.log(`Metadata stored for appid ${appid}`);
            },
            {
                connection: {
                    host: this.config.get('REDIS_HOST') || 'localhost',
                    port: Number(this.config.get('REDIS_PORT')) || 6379
                }
            }
        );
    }
}