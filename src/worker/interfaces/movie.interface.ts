export default interface Movie {
    id: number;
    name: string;
    thumbnail: string;
    webm: Resolutions;
    mp4: Resolutions;
    highlight: boolean;
}

export interface Resolutions {
    "480": string;
    "max": string;
}