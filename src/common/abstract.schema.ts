import { Prop } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export interface IAbstractSchema extends Document {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}

export abstract class AbstractSchema extends Document implements IAbstractSchema {
    @Prop()
    id: string;

    @Prop({ default: Date.now() })
    createdAt: Date;

    @Prop({ default: Date.now() })
    updatedAt: Date;

    @Prop()
    deletedAt: Date;
}
