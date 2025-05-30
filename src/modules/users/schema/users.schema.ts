/* eslint-disable no-invalid-this */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { generateHash } from '../../../common/utils';
import { UserRole } from '../../../constants';

@Schema()
export class Users extends Document {
    @Prop({ type: String })
    name: string;

    @Prop({ type: String, unique: true })
    email: string;

    @Prop({ type: String })
    password: string;

    @Prop({ type: String, enum: UserRole })
    role: UserRole;

    @Prop({ type: Date })
    createdAt: Date;

    @Prop({ type: Date })
    updatedAt: Date;
}

export const UsersSchema = SchemaFactory.createForClass(Users);

UsersSchema.pre('save', function (next) {
    this.password = generateHash(this.password);
    next();
});
