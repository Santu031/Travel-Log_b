# Travel Log Backend

This is the backend service for the Travel Log application.

## Deployment to Render

To deploy only the backend to Render:

1. Use the `render.yaml` file in this directory
2. Set the required environment variables in the Render dashboard:
   - `MONGO_URI` - Your MongoDB connection string
   - `JWT_SECRET` - Secret for JWT token generation (optional, defaults to a development key)
   - `GEMINI_API_KEY` - Google Gemini API key for AI features (optional)

## Environment Variables

- `MONGO_URI` - Required. MongoDB connection string
- `JWT_SECRET` - Optional. Secret for JWT token generation
- `GEMINI_API_KEY` - Optional. Google Gemini API key for AI features
- `PORT` - Optional. Port to run the server on (defaults to 3001)

## API Endpoints

- `/api/auth` - Authentication routes
- `/api/travel` - Travel log routes
- `/api/ai` - AI recommendation routes
- `/api/gallery` - Gallery photo routes
- `/api/reviews` - Review routes