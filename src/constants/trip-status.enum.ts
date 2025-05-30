export enum TripStatus {
    OPEN = 'open',
    CLOSED = 'closed',
    COMPLETED = 'completed'
}

export type TripStatusType = keyof typeof TripStatus;
