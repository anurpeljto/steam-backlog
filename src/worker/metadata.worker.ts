import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import axios from "axios";
import { Worker } from "bullmq";
import Genre from "src/common/interfaces/genre.interface";
import { GameMetadata } from "src/entities/game_metadata.entity";
import { GameTimeService } from "src/game-time/game-time.service";
import { Repository } from "typeorm";
import { WorkerService } from "./worker.service";


@Injectable()
export class MetadataWorker implements OnModuleInit{
    private worker: Worker;

    constructor(
        private config: ConfigService,
        private hltbService: GameTimeService,
        private workerService: WorkerService,
        @InjectRepository(GameMetadata) private metadataRepo: Repository<GameMetadata>
    ){}

    onModuleInit() {
        this.worker = new Worker(
            'metadata',
            async job => {
                const {appid} = job.data;
                const data = await this.workerService.getGameDetails(appid);

                const appData = data[appid]?.data;

                if (!appData || !appData.name) {
                    console.warn(`No valid appData for appid ${appid}`);
                    return;
                }
                console.log('Appdata valid: ', appData.name);

                const hltb = await this.hltbService.getGameTime(appData.name);
                if (!hltb || Object.keys(hltb).length === 0) {
                    console.log(`Empty HLTB data for appid ${appid}`);
                }

                try {
                    await this.metadataRepo.save({
                        appid,
                        name: appData.name,
                        genres: appData.genres?.map((g: Genre) => g.description),
                        categories: appData.categories?.map((c: Genre) => c.description),
                        tags: [],
                        last_fetched: new Date(),
                        header_image: appData.header_image,
                        hltb_100_percent: hltb.completely || null,
                        hltb_main_story: hltb.normally || null
                    });
                    console.log('Saved metadata for: ', appData.name);
                    } catch (err) {
                      console.log(`Failed to save metadata for appid ${appid}`, err);
                    }
            },
            {
                connection: {
                    host: this.config.get('REDIS_HOST') || 'localhost',
                    port: Number(this.config.get('REDIS_PORT')) || 6379
                }
            }
        );
    }

    // async onModuleDestroy() {
    //     if (this.worker) {
    //         await this.worker.close();
    //     }
    // }
}