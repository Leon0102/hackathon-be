import type { TokenType } from '../constants';

interface ITokenPayload {
    userEmail: string;
    email: string;
    role: string;
    type: TokenType;
}

export default ITokenPayload;
