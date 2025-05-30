export enum AdminRole {
    MODERATOR = 'moderator',
    ADMIN = 'admin'
}

export type AdminRoleType = keyof typeof AdminRole;
