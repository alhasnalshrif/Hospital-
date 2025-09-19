# Hospital Management System - Frontend

A modern, responsive React frontend for the Hospital Management System built with TypeScript, Tailwind CSS, and optimized for performance and accessibility.

## 🚀 Features

### ✨ Modern UI/UX
- **Mobile-first responsive design** - Works seamlessly across all devices
- **Clean, professional interface** - Designed for healthcare professionals
- **Accessibility focused** - WCAG 2.1 compliant with proper focus management
- **Dark/Light theme ready** - Infrastructure for theme switching

### 🔧 Technical Excellence
- **TypeScript** - Type-safe development with comprehensive type definitions
- **React 18** - Latest React with concurrent features
- **Tailwind CSS** - Utility-first CSS framework for rapid development
- **React Query** - Optimized server state management with caching
- **React Hook Form** - Performant forms with validation
- **Framer Motion** - Smooth animations and transitions

### 🏥 Hospital Management Features
- **Patient Management** - Comprehensive patient registration and records
- **Appointment Scheduling** - Intuitive calendar-based scheduling
- **Medical Records** - Digital health records with search and filtering
- **Billing System** - Complete financial management
- **Role-based Access** - Secure access control for different user roles
- **Real-time Dashboard** - Live updates and analytics

## 🏗️ Architecture

### Component Structure
```
src/
├── components/
│   ├── common/           # Reusable UI components
│   ├── forms/           # Form components
│   ├── layouts/         # Layout components
│   └── pages/           # Page-level components
├── hooks/               # Custom React hooks
├── services/            # API and external services
├── stores/              # State management
├── styles/              # Global styles and themes
├── types/               # TypeScript type definitions
└── utils/               # Utility functions
```

### Design System
- **Color Palette**: Primary, Success, Warning, Error, and Neutral scales
- **Typography**: Inter font family with responsive scaling
- **Spacing**: Consistent 4px base unit system
- **Components**: Reusable button, form, table, and modal components
- **Responsive**: Mobile-first breakpoints (sm, md, lg, xl)

### Performance Optimizations
- **Code Splitting** - Route-based lazy loading
- **Tree Shaking** - Eliminates unused code
- **Image Optimization** - WebP format with fallbacks
- **Caching Strategy** - React Query with intelligent cache management
- **Bundle Analysis** - Optimized bundle size

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Backend API running on `http://localhost:3000`

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:3001
```

### Build for Production
```bash
# Build optimized production bundle
npm run build

# Preview production build
npm run preview
```

## 🔐 Authentication

The frontend includes a secure authentication system with:
- JWT token-based authentication
- Automatic token refresh
- Role-based route protection
- Secure logout

### Demo Credentials
- **Admin**: admin@hospital.com / admin123
- **Doctor**: doctor@hospital.com / doctor123

## 📱 Responsive Design

The interface is fully responsive with:
- **Mobile**: Optimized for phones (375px+)
- **Tablet**: Enhanced for tablets (768px+)
- **Desktop**: Full features for desktops (1024px+)
- **Large Screen**: Optimized for large displays (1280px+)

### Key Responsive Features
- Collapsible sidebar navigation
- Touch-friendly buttons and forms
- Optimized data tables with horizontal scrolling
- Mobile-first component design

## ♿ Accessibility

Built with accessibility in mind:
- **Keyboard Navigation** - Full keyboard support
- **Screen Reader Support** - Proper ARIA labels and roles
- **Focus Management** - Visible focus indicators
- **Color Contrast** - WCAG AA compliant contrast ratios
- **Semantic HTML** - Proper heading hierarchy and landmarks

## 🎨 Theming

### CSS Custom Properties
The design system uses CSS custom properties for:
- Color schemes
- Typography scales
- Spacing systems
- Border radii
- Shadow depths

### Tailwind Configuration
Customized Tailwind config with:
- Extended color palette
- Custom font families
- Additional spacing values
- Animation utilities
- Responsive breakpoints

## 🔧 Development

### Code Style
- **ESLint** - Code linting with React and TypeScript rules
- **Prettier** - Code formatting (configured)
- **TypeScript** - Strict type checking
- **Conventional Commits** - Standardized commit messages

### Testing (Future Enhancement)
- Unit tests with Jest and React Testing Library
- Integration tests for user flows
- E2E tests with Playwright
- Component testing with Storybook

### Performance Monitoring
- Bundle size tracking
- Core Web Vitals monitoring
- Error boundary implementation
- Loading state management

## 🔄 State Management

### React Query
- **Server State** - API data caching and synchronization
- **Background Updates** - Automatic refetching
- **Optimistic Updates** - Instant UI feedback
- **Error Handling** - Centralized error management

### Local State
- React useState for component state
- useReducer for complex state logic
- Context API for theme and auth state
- Custom hooks for reusable logic

## 🌐 API Integration

### Features
- **Automatic Auth Headers** - JWT tokens added automatically
- **Request/Response Interceptors** - Centralized handling
- **Error Handling** - User-friendly error messages
- **Loading States** - Automatic loading indicators
- **Retry Logic** - Smart retry for failed requests

### Endpoints
- Authentication: `/api/v1/auth/*`
- Patients: `/api/v1/patients/*`
- Appointments: `/api/v1/appointments/*`
- Medical Records: `/api/v1/medical-records/*`
- Billing: `/api/v1/billing/*`

## 🚀 Deployment

### Build Output
```bash
npm run build
# Creates optimized build in dist/ directory
```

### Environment Variables
Create `.env.local` for local development:
```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_APP_TITLE=Hospital Management System
```

### Production Considerations
- Enable gzip compression
- Configure proper cache headers
- Set up error monitoring (Sentry)
- Implement analytics (Google Analytics)

## 📄 Browser Support

- **Chrome** 90+
- **Firefox** 88+
- **Safari** 14+
- **Edge** 90+

## 🤝 Contributing

1. Follow the established component patterns
2. Write TypeScript for all new code
3. Add proper accessibility attributes
4. Test on mobile devices
5. Update documentation for new features

## 📊 Performance Metrics

Target metrics:
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

## 🔮 Future Enhancements

- Progressive Web App (PWA) features
- Offline support with service workers
- Real-time notifications with WebSockets
- Advanced data visualization
- Multi-language support (i18n)
- Print optimization for medical reports