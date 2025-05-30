export enum TravelStyle {
    ADVENTURE = 'adventure',
    RELAXATION = 'relaxation',
    CULTURAL = 'cultural',
    BUSINESS = 'business',
    LUXURY = 'luxury',
    BUDGET = 'budget'
}

export type TravelStyleType = keyof typeof TravelStyle;
