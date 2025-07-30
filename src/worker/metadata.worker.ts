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
import { OwnedGame } from "src/entities/ownedgame.entity";
import GameDetailsResponse, { GameDetails } from "./interfaces/game-details.interface";


@Injectable()
export class MetadataWorker implements OnModuleInit{
    private worker: Worker;

    constructor(
        private config: ConfigService,
        private hltbService: GameTimeService,
        private workerService: WorkerService,
        @InjectRepository(OwnedGame) private ownedGameRepo: Repository<OwnedGame>,
        @InjectRepository(GameMetadata) private metadataRepo: Repository<GameMetadata>
    ){}

    onModuleInit() {
        this.worker = new Worker(
            'metadata',
            async job => {
                const {appid} = job.data;
                await this.sleep(2000);
                let data: GameDetailsResponse;
                try {
                    data = await this.workerService.getGameDetails(appid);
                } catch (err) {
                    console.error(`Failed to fetch Steam API for appid ${appid}`, err.message);
                    return;
                }

                const appData = data[appid]?.data;
                if (!appData || !appData.name) {
                    console.warn(`No valid appData for appid ${appid}`);
                    return;
                }
                console.log('Appdata valid: ', appData.name);

                const hltb = await this.hltbService.getGameTime(appData.name);
                if (!hltb || Object.keys(hltb).length === 0) {
                    console.log(`Empty HLTB data for appid ${appid}`);
                    await this.metadataRepo.save({
                        appid,
                        name: appData.name,
                        genres: appData.genres?.map((g: Genre) => g.description),
                        categories: appData.categories?.map((c: Genre) => c.description),
                        tags: [],
                        last_fetched: new Date(),
                        header_image: appData.header_image,
                        hltb_100_percent: null,
                        hltb_main_story: null
                    } as any);
                    return;
                }

                try {
                    console.log('saving');
                    await this.metadataRepo.save({
                        appid,
                        name: appData.name,
                        genres: appData.genres?.map((g: Genre) => g.description),
                        categories: appData.categories?.map((c: Genre) => c.description),
                        tags: [],
                        last_fetched: new Date(),
                        header_image: appData.header_image,
                        hltb_100_percent: hltb && hltb.completely ? hltb.completely : null,
                        hltb_main_story: hltb && hltb.normally ? hltb.normally : null
                    });
                    console.log('Saved metadata for: ', appData.name);

                    const game = await this.ownedGameRepo.findOne({
                        where: {
                            appid: appid
                        }
                    });
                    if(!game){
                        console.log('Could not get game from ownedgames table');
                        return;
                    }
                    game.isCompleted = this.getIsCompleted(game.playtime_minutes, hltb.completely);
                    await this.ownedGameRepo.save(game);
                    } catch (err) {
                      console.log(`Failed to save metadata for appid ${appid}`, err);
                    }
            },
            {
                connection: {
                    host: this.config.get('REDIS_HOST') || 'localhost',
                    port: Number(this.config.get('REDIS_PORT')) || 6379
                },
                concurrency: 2
            }
        );
    }

    // async onModuleDestroy() {
    //     if (this.worker) {
    //         await this.worker.close();
    //     }
    // }

    getIsCompleted(playedTime: number, completionTime: number){
        if(!completionTime){
            return null;
        }
        return (playedTime*60) > completionTime;
    }

    sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}