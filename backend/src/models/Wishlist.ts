import mongoose, { Document, Schema } from 'mongoose';

export interface IWishlist extends Document {
  userId: mongoose.Types.ObjectId;
  products: Array<{
    productId: string;
    name: string;
    price: number;
    imageUrl: string;
    petId?: mongoose.Types.ObjectId;
    addedAt: Date;
    notes?: string;
    priority?: 'low' | 'medium' | 'high';
    reminderDate?: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const wishlistSchema = new Schema<IWishlist>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    products: [{
      productId: {
        type: String,
        required: true
      },
      name: {
        type: String,
        required: true,
        trim: true
      },
      price: {
        type: Number,
        required: true,
        min: 0
      },
      imageUrl: {
        type: String,
        required: true
      },
      petId: {
        type: Schema.Types.ObjectId,
        ref: 'Pet'
      },
      addedAt: {
        type: Date,
        default: Date.now
      },
      notes: {
        type: String,
        maxlength: 500
      },
      priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
      },
      reminderDate: Date
    }]
  },
  {
    timestamps: true
  }
);

// Índices
wishlistSchema.index({ userId: 1, 'products.productId': 1 });
wishlistSchema.index({ 'products.addedAt': -1 });

// Métodos
wishlistSchema.methods.addProduct = async function(product: any) {
  const exists = this.products.some((p: any) => p.productId === product.productId);
  
  if (!exists) {
    this.products.push({
      ...product,
      addedAt: new Date()
    });
    return this.save();
  }
  
  return this;
};

wishlistSchema.methods.removeProduct = async function(productId: string) {
  this.products = this.products.filter((p: any) => p.productId !== productId);
  return this.save();
};

wishlistSchema.methods.updateProductPriority = async function(productId: string, priority: string) {
  const product = this.products.find((p: any) => p.productId === productId);
  if (product) {
    product.priority = priority;
    return this.save();
  }
  return this;
};

wishlistSchema.methods.getHighPriorityItems = function() {
  return this.products.filter((p: any) => p.priority === 'high');
};

export const Wishlist = mongoose.model<IWishlist>('Wishlist', wishlistSchema);
export default Wishlist;