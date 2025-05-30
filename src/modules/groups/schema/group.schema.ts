import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Group extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Trips', required: true })
  trip: Types.ObjectId;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'Users', required: true })
  owner: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Users' }], default: [] })
  members: Types.ObjectId[];

  @Prop({ type: Number, required: true, min: 1 })
  maxParticipants: number;
}

export type GroupDocument = Group & Document;
export const GroupSchema = SchemaFactory.createForClass(Group);
