# Frontend Deployment on Netlify

Deploy this `frontend` folder on Netlify.

Settings:

```text
Base directory: frontend
Build command: npm install && npm run build
Publish directory: frontend/.next
```

Environment variable in Netlify:

```text
NEXT_PUBLIC_API_URL=https://your-render-backend.onrender.com/api
```

Do not upload a frontend `.env` file.
