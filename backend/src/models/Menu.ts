import mongoose, { Schema } from "mongoose";

const MenuCategorySchema = new Schema(
  {
    restaurantId: { type: Schema.Types.ObjectId, ref: "Restaurant", required: true, index: true },
    name: { type: String, required: true },
    nameAr: String,
    sortOrder: { type: Number, default: 0 }
  },
  { timestamps: true }
);

const MenuItemSchema = new Schema(
  {
    restaurantId: { type: Schema.Types.ObjectId, ref: "Restaurant", required: true, index: true },
    categoryId: { type: Schema.Types.ObjectId, ref: "MenuCategory", required: true },
    name: { type: String, required: true },
    nameAr: String,
    description: String,
    descriptionAr: String,
    price: { type: Number, required: true, min: 0 },
    image: String,
    isAvailable: { type: Boolean, default: true },
    isVegetarian: { type: Boolean, default: false },
    calories: Number
  },
  { timestamps: true }
);

export const MenuCategory =
  mongoose.models.MenuCategory || mongoose.model("MenuCategory", MenuCategorySchema);
export const MenuItem = mongoose.models.MenuItem || mongoose.model("MenuItem", MenuItemSchema);
