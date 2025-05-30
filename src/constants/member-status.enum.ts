export enum MemberStatus {
    JOINED = 'joined',
    INVITED = 'invited',
    REQUESTED = 'requested'
}

export type MemberStatusType = keyof typeof MemberStatus;
