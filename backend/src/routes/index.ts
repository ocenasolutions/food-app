import { Router } from "express";
import { login, register } from "../controllers/authController.js";
import { adminDashboard, restaurantDashboard } from "../controllers/dashboardController.js";
import { createOrder, listOrders, updateOrderStatus } from "../controllers/orderController.js";
import { getRestaurant, listRestaurants } from "../controllers/publicController.js";
import { uploadStatus } from "../controllers/uploadController.js";
import { isDatabaseConnected } from "../config/db.js";
import { DeliveryPartner } from "../models/Support.js";
import { createPaymentIntent } from "../services/paymentService.js";
import { authenticate, authorize } from "../middleware/auth.js";

export const router = Router();

router.get("/health", (_req, res) => res.json({ ok: true }));

// Public routes
router.post("/auth/register", register);
router.post("/auth/login", login);
router.get("/restaurants", listRestaurants);
router.get("/restaurants/:id", getRestaurant);

// Protected routes - require authentication
router.get("/orders", authenticate, listOrders);
router.post("/orders", authenticate, createOrder);
router.patch("/orders/:id/status", authenticate, updateOrderStatus);
router.get("/dashboards/admin", authenticate, authorize("admin"), adminDashboard);
router.get("/dashboards/restaurant", authenticate, authorize("restaurant_staff", "admin"), restaurantDashboard);

// Admin management routes
router.get("/admin/users", authenticate, authorize("admin"), async (_req, res) => {
  try {
    if (isDatabaseConnected()) {
      const { User } = await import("../models/User.js");
      const users = await User.find().select("-password").lean();
      return res.json({ data: users, source: "database" });
    }
    const { readMockData } = await import("../services/mockStore.js");
    const data = await readMockData<any>();
    res.json({ data: data.users || [], source: "mock" });
  } catch (error: any) {
    console.error("Get users error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/admin/delivery-partners", authenticate, authorize("admin"), async (_req, res) => {
  try {
    if (isDatabaseConnected()) {
      const partners = await DeliveryPartner.find()
        .populate("userId", "name email phone")
        .lean();
      return res.json({ data: partners, source: "database" });
    }
    const { readMockData } = await import("../services/mockStore.js");
    const data = await readMockData<any>();
    res.json({ data: data.deliveryPartners || [], source: "mock" });
  } catch (error: any) {
    console.error("Get delivery partners error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/admin/restaurants/:id/status", authenticate, authorize("admin"), async (req, res) => {
  try {
    const { isOpen } = req.body;
    if (isDatabaseConnected()) {
      const { Restaurant } = await import("../models/Restaurant.js");
      const restaurant = await Restaurant.findByIdAndUpdate(
        req.params.id,
        { isOpen },
        { new: true }
      ).lean();
      if (!restaurant) {
        return res.status(404).json({ error: "Restaurant not found" });
      }
      return res.json({ data: restaurant, source: "database" });
    }
    res.status(501).json({ error: "Not implemented in mock mode" });
  } catch (error: any) {
    console.error("Update restaurant status error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/admin/users/:id", authenticate, authorize("admin"), async (req, res) => {
  try {
    if (isDatabaseConnected()) {
      const { User } = await import("../models/User.js");
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      return res.json({ data: { message: "User deleted successfully" }, source: "database" });
    }
    res.status(501).json({ error: "Not implemented in mock mode" });
  } catch (error: any) {
    console.error("Delete user error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/admin/users", authenticate, authorize("admin"), async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;
    
    // Validation
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ error: "All fields are required" });
    }
    
    if (isDatabaseConnected()) {
      const { User } = await import("../models/User.js");
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: "Email already exists" });
      }
      const user = await User.create({ name, email, password, phone, role: role || "customer" });
      const userObj = user.toObject();
      delete userObj.password;
      return res.json({ data: userObj, source: "database" });
    }
    res.status(501).json({ error: "Not implemented in mock mode" });
  } catch (error: any) {
    console.error("Create user error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
});

router.patch("/admin/users/:id", authenticate, authorize("admin"), async (req, res) => {
  try {
    const { name, email, phone, role } = req.body;
    if (isDatabaseConnected()) {
      const { User } = await import("../models/User.js");
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { name, email, phone, role },
        { new: true }
      ).select("-password");
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      return res.json({ data: user, source: "database" });
    }
    res.status(501).json({ error: "Not implemented in mock mode" });
  } catch (error: any) {
    console.error("Update user error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/admin/restaurants", authenticate, authorize("admin"), async (req, res) => {
  try {
    // Validation
    const required = ["name", "description", "address", "coverImage", "logo", "deliveryFee", "minOrder", "deliveryTime"];
    const missing = required.filter(field => !req.body[field]);
    if (missing.length > 0) {
      return res.status(400).json({ error: `Missing required fields: ${missing.join(", ")}` });
    }
    
    if (isDatabaseConnected()) {
      const { Restaurant } = await import("../models/Restaurant.js");
      const restaurant = await Restaurant.create({
        ...req.body,
        cuisines: req.body.cuisines || [],
        rating: req.body.rating || 0,
        reviewCount: req.body.reviewCount || 0,
        priceLevel: req.body.priceLevel || 2,
        isOpen: req.body.isOpen !== undefined ? req.body.isOpen : true,
        supportsDelivery: req.body.supportsDelivery !== undefined ? req.body.supportsDelivery : true,
        supportsPickup: req.body.supportsPickup !== undefined ? req.body.supportsPickup : true
      });
      return res.json({ data: restaurant, source: "database" });
    }
    res.status(501).json({ error: "Not implemented in mock mode" });
  } catch (error: any) {
    console.error("Create restaurant error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
});

router.patch("/admin/restaurants/:id", authenticate, authorize("admin"), async (req, res) => {
  try {
    if (isDatabaseConnected()) {
      const { Restaurant } = await import("../models/Restaurant.js");
      const restaurant = await Restaurant.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!restaurant) {
        return res.status(404).json({ error: "Restaurant not found" });
      }
      return res.json({ data: restaurant, source: "database" });
    }
    res.status(501).json({ error: "Not implemented in mock mode" });
  } catch (error: any) {
    console.error("Update restaurant error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/admin/delivery-partners", authenticate, authorize("admin"), async (req, res) => {
  try {
    const { userId, vehicleType, vehicleNumber, status } = req.body;
    
    // Validation
    if (!userId || !vehicleType || !vehicleNumber) {
      return res.status(400).json({ error: "userId, vehicleType, and vehicleNumber are required" });
    }
    
    if (isDatabaseConnected()) {
      // Check if user exists and is delivery_staff
      const { User } = await import("../models/User.js");
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      if (user.role !== "delivery_staff") {
        return res.status(400).json({ error: "User must have delivery_staff role" });
      }
      
      // Check if partner already exists for this user
      const existing = await DeliveryPartner.findOne({ userId });
      if (existing) {
        return res.status(400).json({ error: "Delivery partner already exists for this user" });
      }
      
      const partner = await DeliveryPartner.create({
        userId,
        vehicleType,
        vehicleNumber,
        status: status || "available",
        assignedOrderIds: []
      });
      const populated = await DeliveryPartner.findById(partner._id).populate("userId", "name email phone");
      return res.json({ data: populated, source: "database" });
    }
    res.status(501).json({ error: "Not implemented in mock mode" });
  } catch (error: any) {
    console.error("Create delivery partner error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
});

router.patch("/admin/delivery-partners/:id", authenticate, authorize("admin"), async (req, res) => {
  try {
    if (isDatabaseConnected()) {
      const partner = await DeliveryPartner.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      ).populate("userId", "name email phone");
      if (!partner) {
        return res.status(404).json({ error: "Partner not found" });
      }
      return res.json({ data: partner, source: "database" });
    }
    res.status(501).json({ error: "Not implemented in mock mode" });
  } catch (error: any) {
    console.error("Update delivery partner error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});
router.get("/uploads/status", authenticate, uploadStatus);
router.get("/delivery/assigned", authenticate, authorize("delivery_staff", "admin"), async (_req, res) => {
  try {
    if (isDatabaseConnected()) {
      const partner = await DeliveryPartner.findOne({ status: { $in: ["on_delivery", "available"] } })
        .populate("userId", "name email phone role")
        .populate("assignedOrderIds")
        .lean();
      return res.json({ data: partner, source: "database" });
    }

    const { readMockData } = await import("../services/mockStore.js");
    const data = await readMockData<any>();
    res.json({ data: data.deliveryPartners[0], source: "mock" });
  } catch (error: any) {
    console.error("Delivery assigned error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});
router.post("/payments/intent", authenticate, async (req, res) => {
  try {
    const intent = await createPaymentIntent(req.body);
    res.json({ data: intent, source: "database" });
  } catch (error: any) {
    console.error("Payment intent error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});
