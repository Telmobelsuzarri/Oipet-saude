import mongoose, { Document, Schema } from 'mongoose';

export interface IProductView extends Document {
  productId: string;
  userId?: string;
  viewedAt: Date;
  sessionId?: string;
  referrer?: string;
  userAgent?: string;
}

const ProductViewSchema: Schema = new Schema({
  productId: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  viewedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  sessionId: {
    type: String,
    index: true
  },
  referrer: {
    type: String
  },
  userAgent: {
    type: String
  }
});

// Índice composto para consultas de analytics
ProductViewSchema.index({ productId: 1, viewedAt: -1 });
ProductViewSchema.index({ userId: 1, viewedAt: -1 });

export const ProductView = mongoose.model<IProductView>('ProductView', ProductViewSchema);