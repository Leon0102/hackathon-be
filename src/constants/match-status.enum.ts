export enum MatchStatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    REJECTED = 'rejected'
}

export type MatchStatusType = keyof typeof MatchStatus;
