export default interface Game {
    appid: number;
    playtime_forever: number;
    playtime_windows_forever: number;
    playtime_mac_forever: number;
    playtime_linux_forever: number;
    playtime_deck_forever: number;
    rtime_last_played: number;
    playtime_disconnected: number;
}

export interface GameResponse {
    response: {
        game_count: number;
        games: Game[];
    }
}