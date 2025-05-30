export enum MessageType {
    TEXT = 'text',
    IMAGE = 'image',
    SYSTEM = 'system'
}

export type MessageTypeType = keyof typeof MessageType;
