export enum AuthProvider {
    LOCAL = 'local',
    GOOGLE = 'google',
    FACEBOOK = 'facebook'
}

export type AuthProviderType = keyof typeof AuthProvider;
