import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Users } from '../../users/schema/users.schema';
import { Trips } from './trips.schema';

@Schema({ timestamps: true })
export class RecommendationLog extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Users', required: true })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Trips', required: true })
  trip: Types.ObjectId;

  @Prop({ type: String, required: true })
  keyword: string;
}

export const RecommendationLogSchema = SchemaFactory.createForClass(RecommendationLog);
