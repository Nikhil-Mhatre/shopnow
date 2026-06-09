import { Schema, model, Document } from 'mongoose';

export interface IAssociation extends Document {
  productId: string;
  associatedProductId: string;
  purchaseCount: number;
  updatedAt: Date;
}

const AssociationSchema = new Schema<IAssociation>({
  productId: { type: String, required: true, index: true },
  associatedProductId: { type: String, required: true },
  purchaseCount: { type: Number, default: 1, required: true }
}, { timestamps: true });

// Ensure quick lookup configurations across pairs
AssociationSchema.index({ productId: 1, purchaseCount: -1 });

export const AssociationModel = model<IAssociation>('Association', AssociationSchema);