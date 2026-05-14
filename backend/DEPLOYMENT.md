# Backend Deployment on Render

Deploy this `backend` folder on Render.

Settings:

```text
Root directory: backend
Build command: npm install && npm run build
Start command: npm run start
Health check path: /api/health
```

Required Render environment variables:

```text
JWT_SECRET=use-a-long-random-secret
FRONTEND_URL=https://your-netlify-site.netlify.app
```

Optional:

```text
MONGODB_URI=
STRIPE_SECRET_KEY=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

If optional services are empty, the backend falls back gracefully:

- MongoDB empty: uses `backend/mock-data/seed.json`.
- Stripe/Razorpay empty: payment intent returns `gateway_not_configured`.
- Cloudinary empty: uploads return disabled status.
