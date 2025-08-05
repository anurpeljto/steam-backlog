import Genre from "src/common/interfaces/genre.interface";
import Movie from "./movie.interface";

export default interface GameDetailsResponse {
    [appid: string]: {
        success: boolean;
        data: GameDetails;
    }
}

export interface GameDetails {
    type: string;
    name: string;
    steam_appid: number;
    required_age: number;
    is_free: boolean;
    detailed_description: string;
    about_the_game: string;
    short_description: string;
    supported_languages: string;
    header_image: string;
    capsule_image: string;
    capsule_imagev5: string;
    website: string | null;
    pc_requirements: {
        minimum: string;
        recommended: string;
    };
    mac_requirements?: {
        minimum: string;
        recommended: string;
    };
    linux_requirements?: {
        minimum: string;
        recommended: string;
    };
    developers: string[];
    publishers: string[];
    package_groups: string[];
    platforms: {
        windows: boolean;
        mac: boolean;
        linux: boolean;
    };
    categories: Genre[];
    genres: Genre[];
    movies: Movie[];
    release_date: {
        coming_soon: boolean;
        date: string;
    };
    support_info: {
        url: string;
        email: string;
    };
    background: string;
    background_raw: string;
    content_descriptors: {
        ids: [],
        notes: string | null
    };
    ratings: {
        "dejus"?: Rating;
        "pegi"?: Rating;
        "steam_germany"?: Rating;
    };
    recommendations?: {
        total: number;
    };
}

export interface Rating {
    rating_generated: string;
    rating: string;
    required_age: string;
    banned: string;
    use_age_gate: string;
    descriptors: string;
}