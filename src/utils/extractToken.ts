export default function extractToken(token: string) {
    const cleanToken = token?.split(' ')[1];
    return cleanToken;
}