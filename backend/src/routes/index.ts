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
