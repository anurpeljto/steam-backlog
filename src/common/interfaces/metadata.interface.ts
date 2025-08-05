export default interface MetaData {
    appid: number;
    genres: string[];
    categories: string[];
    tags: string[];
    hltb_main_story: number | null;
    hltb_100_percent: number | null;
    last_fetched: string;
    description: string;
    name: string;
    header_image: string;
    rating?: number | null;
}