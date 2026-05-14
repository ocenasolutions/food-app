import mongoose, { Schema } from "mongoose";

const RestaurantSchema = new Schema(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    nameAr: String,
    description: String,
    descriptionAr: String,
    coverImage: String,
    logo: String,
    cuisines: [{ type: String }],
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    deliveryTime: String,
    priceLevel: { type: Number, min: 1, max: 4, default: 2 },
    deliveryFee: { type: Number, default: 0 },
    minOrder: { type: Number, default: 0 },
    isOpen: { type: Boolean, default: true },
    supportsDelivery: { type: Boolean, default: true },
    supportsPickup: { type: Boolean, default: true },
    address: String
  },
  { timestamps: true }
);

RestaurantSchema.index({ name: "text", cuisines: "text" });

export const Restaurant = mongoose.models.Restaurant || mongoose.model("Restaurant", RestaurantSchema);
