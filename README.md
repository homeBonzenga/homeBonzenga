# 🎨 HOME BONZENGA - Beauty Appointment & eCommerce Platform

A fully functional, multilingual beauty appointment and eCommerce platform built with React, Node.js, and modern web technologies.

## ✨ Features

### 🌍 Multilingual Support
- **English & French** language support
- Dynamic language switching with persistent storage
- Complete UI translation coverage
- Localized content for all pages

### 🔐 Authentication & Authorization
- **JWT-based authentication** with refresh tokens
- **Role-based access control**: Customer, Vendor, Admin
- Secure login/registration system
- Protected routes and middleware

### 👥 User Roles & Dashboards

#### Customer Dashboard
- Book beauty services and appointments
- View booking history and status
- Track orders and delivery
- Payment management

#### Vendor Dashboard
- Manage services and availability
- View and confirm appointments
- Track earnings and performance
- Service portfolio management

#### Admin Dashboard
- Platform-wide analytics and insights
- User and vendor management
- Service and product oversight
- Financial reporting and monitoring

### 💳 Payment Integration
- **Razorpay** integration (primary for India)
- **Stripe** fallback support
- Multiple payment methods: Cards, UPI, Wallets
- Secure payment processing
- Transaction tracking and history

### 🚚 Order & Delivery Management
- Complete order lifecycle management
- Real-time delivery tracking
- Status updates and notifications
- Delivery timeline visualization

### 🎨 Modern UI/UX
- **Tailwind CSS** with custom brown/dark red theme
- Responsive design for all devices
- Smooth animations and transitions
- Accessible components with ARIA support

## 🚀 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **React Router DOM** for routing
- **Tailwind CSS** for styling
- **Radix UI** components for accessibility
- **React Hook Form** with Zod validation
- **React i18next** for internationalization

### Backend
- **Node.js** with **Express.js**
- **TypeScript** for type safety
- **Prisma ORM** for database operations
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Zod** for request validation
- **Winston** for structured logging

### Database
- **SQLite** for development (easily switchable to PostgreSQL)
- **Prisma** schema with migrations
- Optimized for beauty service data

### Security
- **Helmet** for security headers
- **CORS** with origin validation
- **Rate limiting** for API protection
- **Input sanitization** and validation

## 📋 Prerequisites

- **Node.js** 18+ 
- **npm** or **yarn**
- **Git**

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd home-beauty
```

### 2. Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 3. Environment Configuration

#### Frontend (.env)
```bash
VITE_API_URL=http://localhost:8080
```

#### Backend (server/.env)
```bash
NODE_ENV=development
PORT=8080
CORS_ORIGIN=http://localhost:8081
JWT_SECRET=your-super-secret-jwt-key-here
DATABASE_URL=file:./dev.db
```

### 4. Database Setup
```bash
cd server
npx prisma generate
npx prisma db push
```

### 5. Start Development Servers

#### Terminal 1 - Backend
```bash
cd server
npm run dev
```

#### Terminal 2 - Frontend
```bash
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:8081
- **Backend API**: http://localhost:8080

## 🧪 Testing

### Frontend Tests
```bash
npm test
```

### Backend Tests
```bash
cd server
npm test
```

## 🚀 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend (Render/Railway/Heroku)
1. Connect your repository to your preferred platform
2. Set environment variables:
   - `NODE_ENV=production`
   - `PORT` (auto-assigned)
   - `CORS_ORIGIN` (your frontend URL)
   - `JWT_SECRET` (strong secret key)
   - `DATABASE_URL` (production database)

3. Deploy and get your backend URL
4. Update frontend `VITE_API_URL` with backend URL

## 📁 Project Structure

```
home-beauty/
├── src/                          # Frontend source
│   ├── components/               # Reusable UI components
│   ├── pages/                    # Page components
│   ├── contexts/                 # React contexts
│   ├── hooks/                    # Custom hooks
│   ├── lib/                      # Utility functions
│   ├── locales/                  # Translation files
│   └── assets/                   # Static assets
├── server/                       # Backend source
│   ├── src/
│   │   ├── routes/               # API routes
│   │   ├── middleware/            # Express middleware
│   │   ├── lib/                  # Utility functions
│   │   └── socket/               # WebSocket handlers
│   └── prisma/                   # Database schema
├── supabase/                     # Database migrations
└── public/                       # Public assets
```

## 🔧 Available Scripts

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm test             # Run tests
```

### Backend
```bash
cd server
npm run dev          # Start development server
npm run build        # Build TypeScript
npm start            # Start production server
npm test             # Run tests
```

## 🌐 API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8080/docs
- **OpenAPI JSON**: http://localhost:8080/docs/openapi.json

## 🔐 Demo Accounts

For testing purposes, use these demo accounts:

- **Admin**: admin@beautybook.com / admin123
- **Customer**: customer@demo.com / demo123  
- **Vendor**: vendor@demo.com / demo123

## 🎨 Customization

### Theme Colors
The brown and dark red theme can be customized in `tailwind.config.ts`:

```typescript
primary: {
  DEFAULT: "#8B4513",    // Brown
  // ... other shades
},
secondary: {
  DEFAULT: "#8B0000",    // Dark Red
  // ... other shades
}
```

### Adding New Languages
1. Create new translation file in `src/locales/`
2. Update `src/i18n.ts` to include new language
3. Add language switcher option in `LanguageSwitcher.tsx`

## 🐛 Troubleshooting

### Common Issues

#### Frontend not loading
- Check if backend is running on port 8080
- Verify `VITE_API_URL` in `.env`
- Check browser console for errors

#### Backend connection issues
- Ensure database is properly set up
- Check `DATABASE_URL` in `server/.env`
- Verify CORS settings match frontend URL

#### Language switching not working
- Clear browser localStorage
- Check if translation files are properly imported
- Verify i18n configuration

### Getting Help
1. Check the browser console for error messages
2. Review the terminal output for backend errors
3. Ensure all environment variables are set correctly
4. Verify database connection and schema

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is not yer licensed.

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by the need for accessible beauty services
- Designed for scalability and maintainability

---
## Testing test Branch

- Adding or makeing changesing and later pshing in the test Branch

---

**Happy coding with Ccube Netvix! 🎉**

For support or questions, please open an issue in the repository.

