# Food Delivery System

A full-stack food delivery application with React frontend and Node.js backend.

## Project Structure

\`\`\`
food-delivery-system/
├── frontend/          # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── utils/
│   └── package.json
├── backend/           # Node.js + Express backend
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   ├── controllers/
│   └── package.json
└── README.md
\`\`\`

## Features

### Authentication
- User registration and login
- JWT-based authentication
- Role-based access (Customer/Admin)

### Customer Features
- Browse restaurants by location/category
- View restaurant details and menus
- Search food items with filters
- Place and track orders

### Admin Features
- Restaurant dashboard
- Menu management (CRUD)
- Order management
- Analytics and reporting

## Setup Instructions

### Backend Setup
1. Navigate to backend directory: `cd backend`
2. Install dependencies: `npm install`
3. Copy environment file: `cp .env.example .env`
4. Update environment variables in `.env`
5. Start development server: `npm run dev`

### Frontend Setup
1. Navigate to frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`

### Database Setup
- Install MongoDB locally or use MongoDB Atlas
- Update `MONGODB_URI` in backend `.env` file

## Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Backend
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Restaurants
- `GET /api/restaurants` - Get all restaurants
- `GET /api/restaurants/:id` - Get restaurant details
- `POST /api/restaurants` - Create restaurant (Admin)

### Menu
- `GET /api/menu/:restaurantId` - Get restaurant menu
- `POST /api/menu` - Add menu item (Admin)
- `PUT /api/menu/:id` - Update menu item (Admin)
- `DELETE /api/menu/:id` - Delete menu item (Admin)

### Orders
- `POST /api/orders` - Place order
- `GET /api/orders` - Get user orders
- `GET /api/orders/admin` - Get all orders (Admin)

### Search
- `GET /api/search?q=query&filters` - Search food items

## Technologies Used

### Frontend
- React 18
- Vite
- React Router v6
- TailwindCSS
- Axios
- React Hook Form
- React Query
- React Icons

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Bcrypt for password hashing
- Multer for file uploads
- Helmet for security
- CORS support

## Environment Variables

See `.env.example` files in both frontend and backend directories for required environment variables.
