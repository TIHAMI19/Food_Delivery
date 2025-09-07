# Food Delivery System Setup Guide

## Overview
This is a full-stack food delivery application with separate React frontend and Node.js backend. The system supports three user roles: Customer, Rider, and Admin (Restaurant Owner).

## Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

## Project Structure
\`\`\`
food-delivery-system/
├── frontend/          # React application
├── backend/           # Node.js Express server
├── app/              # v0 display wrapper
└── setup.md          # This file
\`\`\`

## Backend Setup

### 1. Navigate to Backend Directory
\`\`\`bash
cd backend
\`\`\`

### 2. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 3. Environment Configuration
Create a `.env` file in the backend directory:
\`\`\`env
PORT=5000
FRONTEND_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/food-delivery
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
\`\`\`

### 4. Database Setup
- **Local MongoDB**: Ensure MongoDB is running on your machine
- **MongoDB Atlas**: Replace MONGODB_URI with your Atlas connection string

### 5. Seed Sample Data (Optional)
\`\`\`bash
node scripts/seed-data.js
\`\`\`

### 6. Start Backend Server
\`\`\`bash
npm run dev
\`\`\`
Backend will run on http://localhost:5000

## Frontend Setup

### 1. Navigate to Frontend Directory
\`\`\`bash
cd frontend
\`\`\`

### 2. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 3. Environment Configuration
Create a `.env` file in the frontend directory:
\`\`\`env
VITE_API_URL=http://localhost:5000/api
\`\`\`

### 4. Start Frontend Development Server
\`\`\`bash
npm run dev
\`\`\`
Frontend will run on http://localhost:3000

## Running the Complete Application

### Option 1: Manual Start (Recommended for Development)
1. **Terminal 1** - Start Backend:
   \`\`\`bash
   cd backend && npm run dev
   \`\`\`

2. **Terminal 2** - Start Frontend:
   \`\`\`bash
   cd frontend && npm run dev
   \`\`\`

### Option 2: Using Concurrently (if configured)
From the root directory:
\`\`\`bash
npm run dev
\`\`\`

## User Roles & Testing

### 1. Customer Role
- **Features**: Browse restaurants, view menus, add items to cart, place orders, track deliveries
- **Test Account**: Register as a new user (default role is 'customer')

### 2. Admin Role (Restaurant Owner)
- **Features**: Manage restaurant profile, CRUD menu items, view/manage orders, analytics dashboard
- **Test Account**: Register and manually change role to 'admin' in database, or use seeded admin account

### 3. Rider Role
- **Features**: View available orders, accept deliveries, update order status, track earnings
- **Test Account**: Register and manually change role to 'rider' in database, or use seeded rider account

## Database Collections

The application uses the following MongoDB collections:
- `users` - User accounts with roles (customer, admin, rider)
- `restaurants` - Restaurant information and profiles
- `menuitems` - Menu items linked to restaurants
- `orders` - Customer orders with status tracking

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Restaurants
- `GET /api/restaurants` - List all restaurants
- `GET /api/restaurants/:id` - Get restaurant details
- `POST /api/restaurants` - Create restaurant (admin only)

### Menu Items
- `GET /api/menu/restaurant/:id` - Get restaurant menu
- `POST /api/menu` - Add menu item (admin only)
- `PUT /api/menu/:id` - Update menu item (admin only)
- `DELETE /api/menu/:id` - Delete menu item (admin only)

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id/status` - Update order status

### Search
- `GET /api/search` - Search restaurants and menu items

## Troubleshooting

### Common Issues

1. **Backend won't start**
   - Check if MongoDB is running
   - Verify environment variables in `.env`
   - Ensure port 5000 is not in use

2. **Frontend can't connect to backend**
   - Verify VITE_API_URL in frontend `.env`
   - Check if backend is running on correct port
   - Check browser console for CORS errors

3. **Database connection issues**
   - Verify MongoDB URI format
   - Check MongoDB service status
   - Ensure database permissions (for Atlas)

4. **Authentication not working**
   - Check JWT_SECRET is set in backend `.env`
   - Clear browser localStorage/cookies
   - Verify token expiration settings

### Development Tips

1. **Hot Reload**: Both frontend and backend support hot reload during development
2. **API Testing**: Use tools like Postman or Thunder Client to test API endpoints
3. **Database Inspection**: Use MongoDB Compass to view and edit database records
4. **Logging**: Check terminal outputs for detailed error messages

## Production Deployment

### Backend Deployment
1. Set production environment variables
2. Use process manager like PM2
3. Configure reverse proxy (nginx)
4. Set up SSL certificates

### Frontend Deployment
1. Build production bundle: `npm run build`
2. Serve static files from `dist/` directory
3. Configure environment variables for production API URL

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review console logs for error messages
3. Verify all environment variables are correctly set
4. Ensure all dependencies are installed

---

**Happy Coding! 🚀**
