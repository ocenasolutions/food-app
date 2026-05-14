import mongoose, { Schema } from "mongoose";

const AddressSchema = new Schema(
  {
    label: String,
    line1: { type: String, required: true },
    line2: String,
    city: { type: String, required: true },
    country: { type: String, required: true },
    lat: Number,
    lng: Number
  },
  { _id: true }
);

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    phone: { type: String, required: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["customer", "restaurant_staff", "delivery_staff", "admin"],
      default: "customer"
    },
    addresses: [AddressSchema],
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model("User", UserSchema);
