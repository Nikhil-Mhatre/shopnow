import { Schema, model, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  price: number;
  sku: string;
  categories: string[];
  images: string[];
  attributes: {
    name: string;
    value: string;
  }[];
  isFeatured: boolean;
  isOutOfStock: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, index: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  sku: { type: String, required: true, unique: true, index: true },
  categories: [{ type: String, index: true }],
  images: [{ type: String }],

  // The Attribute Pattern - Handles generic infinite elasticity
  attributes: [{
    name: { type: String, required: true },
    value: { type: String, required: true }
  }],

  isFeatured: { type: Boolean, default: false, index: true },
  isOutOfStock: { type: Boolean, default: false, index: true },
  isActive: { type: Boolean, default: true, index: true }
}, { timestamps: true });

// ==========================================
// PERFORMANCE INDEXING LAYER
// ==========================================

// 1. Faceted Filtering Optimization (Compound Multikey Index)
ProductSchema.index({ "attributes.name": 1, "attributes.value": 1 });

// 2. Category Sort Filtering Optimization
ProductSchema.index({ categories: 1, price: 1, isActive: 1 });

// 3. Full-Text Search Optimization (Weighted relevance matrix)
ProductSchema.index(
  { name: 'text', categories: 'text', description: 'text' },
  { weights: { name: 10, categories: 5, description: 1 }, name: 'CatalogTextIndex' }
);

export const ProductModel = model<IProduct>('Product', ProductSchema);