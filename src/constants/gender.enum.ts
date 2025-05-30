export enum Gender {
    MALE = 'male',
    FEMALE = 'female',
    OTHER = 'other',
    PREFER_NOT_TO_SAY = 'prefer-not-to-say'
}

export type GenderType = keyof typeof Gender;
