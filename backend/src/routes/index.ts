import { Router } from "express";
import { login, register } from "../controllers/authController.js";
import { adminDashboard, restaurantDashboard } from "../controllers/dashboardController.js";
import { createOrder, listOrders, updateOrderStatus } from "../controllers/orderController.js";
import { getRestaurant, listRestaurants } from "../controllers/publicController.js";
import { uploadStatus } from "../controllers/uploadController.js";
import { createPaymentIntent } from "../services/paymentService.js";

export const router = Router();

router.get("/health", (_req, res) => res.json({ ok: true }));
router.post("/auth/register", register);
router.post("/auth/login", login);
router.get("/restaurants", listRestaurants);
router.get("/restaurants/:id", getRestaurant);
router.get("/orders", listOrders);
router.post("/orders", createOrder);
router.patch("/orders/:id/status", updateOrderStatus);
router.get("/dashboards/admin", adminDashboard);
router.get("/dashboards/restaurant", restaurantDashboard);
router.get("/uploads/status", uploadStatus);
router.get("/delivery/assigned", async (_req, res) => {
  const { readMockData } = await import("../services/mockStore.js");
  const data = await readMockData<any>();
  res.json({ data: data.deliveryPartners[0], source: "mock" });
});
router.post("/payments/intent", async (req, res) => {
  const intent = await createPaymentIntent(req.body);
  res.json({ data: intent, source: "database" });
});
