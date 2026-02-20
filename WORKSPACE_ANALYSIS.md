# Aadhaar Advance Platform - Workspace Analysis

## Overview

This is a **React-based web application for Aadhaar biometric updates** built with Vite, TypeScript, and Tailwind CSS. It's designed as a secure, AI-powered platform for managing Aadhaar update appointments with fraud detection and intelligent scheduling capabilities.

---

## 🏗️ Project Architecture

### Tech Stack
- **Frontend Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with shadcn-ui components
- **Routing**: React Router v6
- **State Management**: React Context API
- **Data Visualization**: Recharts
- **Animations**: Framer Motion
- **Form Handling**: React Hook Form + Zod validation
- **Notifications**: Sonner (toast library)
- **Testing**: Vitest
- **UI Components**: shadcn-ui (Radix UI primitives)

### Directory Structure

```
aadhaar-advance-main/
├── src/
│   ├── components/
│   │   ├── auth/                      # Authentication components
│   │   │   ├── CaptchaInput.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── SecurityGate.tsx
│   │   ├── booking/                   # Booking flow components
│   │   │   ├── BookingConfirmation.tsx
│   │   │   ├── CenterPicker.tsx
│   │   │   ├── FaceScanVerification.tsx
│   │   │   ├── OnlineUpdateFlow.tsx
│   │   │   ├── SlotPicker.tsx
│   │   │   └── UpdateTypePicker.tsx
│   │   ├── dashboard/                 # Analytics components
│   │   │   ├── CenterLoadCard.tsx
│   │   │   ├── DemandChart.tsx
│   │   │   ├── HourlyLoadChart.tsx
│   │   │   └── RiskPieChart.tsx
│   │   ├── fraud/                     # Fraud detection UI
│   │   │   └── FraudComparisonChart.tsx
│   │   ├── home/                      # Landing page sections
│   │   │   ├── CTASection.tsx
│   │   │   ├── HeroSection.tsx
│   │   │   ├── ProblemSection.tsx
│   │   │   ├── SolutionSection.tsx
│   │   │   └── StatsSection.tsx
│   │   ├── language/                  # Language selector
│   │   │   └── LanguageSelector.tsx
│   │   ├── layout/                    # Page layout
│   │   │   ├── Footer.tsx
│   │   │   └── Header.tsx
│   │   ├── ui/                        # shadcn-ui components
│   │   │   ├── accordion.tsx
│   │   │   ├── alert.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── chart.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── input-otp.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── table.tsx
│   │   │   └── ... (more UI components)
│   │   └── NavLink.tsx
│   ├── contexts/                      # React Context providers
│   │   ├── AuthContext.tsx            # Authentication state
│   │   ├── LanguageContext.tsx        # Multi-language support
│   │   └── UserContext.tsx            # User profile & appointments
│   ├── data/
│   │   └── mockData.ts                # Mock centers, slots, stats
│   ├── hooks/                         # Custom React hooks
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   ├── lib/                           # Utility functions
│   │   ├── translations.ts            # Translation dictionary
│   │   └── utils.ts                   # Tailwind merge utility
│   ├── pages/                         # Page components
│   │   ├── Auth.tsx                   # Login/Signup
│   │   ├── BookSlot.tsx               # Booking page
│   │   ├── Dashboard.tsx              # Analytics dashboard
│   │   ├── FraudAnalytics.tsx         # Security analytics
│   │   ├── Index.tsx                  # Home page
│   │   ├── NotFound.tsx               # 404 page
│   │   ├── Profile.tsx                # User profile
│   │   └── Tracking.tsx               # Appointment tracking
│   ├── test/
│   │   ├── example.test.ts
│   │   └── setup.ts
│   ├── App.tsx                        # Main App component with routing
│   ├── App.css
│   ├── index.css
│   ├── main.tsx                       # React DOM entry point
│   └── vite-env.d.ts
├── public/
│   └── robots.txt
├── database/
│   ├── API_ENDPOINTS.md
│   ├── BACKEND_SETUP.md
│   ├── README.md
│   └── schema.sql
├── package.json                       # Dependencies & scripts
├── tsconfig.json                      # TypeScript config
├── vite.config.ts                     # Vite config
├── tailwind.config.ts                 # Tailwind CSS config
├── postcss.config.js                  # PostCSS config
├── eslint.config.js                   # ESLint config
├── vitest.config.ts                   # Vitest config
└── index.html                         # HTML entry point
```

---

## 📋 Context Providers (State Management)

### 1. AuthContext.tsx
**Purpose**: Manages authentication state and operations

**Key Interfaces**:
```typescript
AuthUser {
  id: string;
  aadharNumber: string;
  name?: string;
  email?: string;
  phone?: string;
}

AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isSecureVerified: boolean;
  login(aadharNumber, password): Promise<boolean>;
  signup(aadharNumber, password): Promise<boolean>;
  sendOtp(target, method): Promise<boolean>;
  verifyOtp(otp, phone?, email?): Promise<boolean>;
  logout(): void;
  secureVerify(password): Promise<boolean>;
  secureVerifyOtp(otp): Promise<boolean>;
  clearSecureVerification(): void;
}
```

**Features**:
- Mock user database (demo: Aadhaar `123456789012`, password `password123`)
- Aadhar number validation (12 digits)
- OTP verification (mock OTP: `123456`)
- Password-based signup
- Multi-factor authentication support
- Demo mode allows any Aadhaar/password combination

### 2. UserContext.tsx
**Purpose**: Manages user profile, appointments, and biometric update tracking

**Key Interfaces**:
```typescript
UserProfile {
  id: string;
  name: string;
  aadhaarNumber: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  lastBiometricUpdate?: Date;
  address: string;
}

ScheduledAppointment {
  id: string;
  center: Center;
  slot: TimeSlot;
  updateType: UpdateType;
  scheduledDate: Date;
  status: 'scheduled' | 'completed' | 'cancelled';
  autoBooked: boolean;
}

UserContextType {
  user: UserProfile | null;
  appointments: ScheduledAppointment[];
  addAppointment(): void;
  needsBiometricUpdate: boolean;
  pendingAutoBooking: ScheduledAppointment | null;
  clearPendingAutoBooking(): void;
}
```

**Key Features**:
- Biometric update age milestones: 5, 15, 25, 35, 45, 55, 65, 75, 85 years
- Automatic age calculation from date of birth
- Biometric requirement checking (within 1 year of milestone)
- Slot auto-assignment based on availability and risk level
- Appointment history tracking

### 3. LanguageContext.tsx
**Purpose**: Multi-language support (internationalization)

**Supported Languages**:
- English (en)
- Telugu (te)
- Hindi (hi)

**Key Interface**:
```typescript
LanguageContextType {
  language: Language;
  setLanguage(lang: Language): void;
  t(key: string): string;  // Translation function
}
```

---

## 📄 Pages & Routes

### Route Structure
| Path | Component | Protected | Purpose |
|------|-----------|-----------|---------|
| `/` | Index | ✅ Yes | Home/landing page |
| `/auth` | Auth | ❌ No | Login/Signup |
| `/dashboard` | Dashboard | ✅ Yes | Analytics dashboard |
| `/book-slot` | BookSlot | ✅ Yes | Appointment booking |
| `/fraud-analytics` | FraudAnalytics | ✅ Yes | Security analytics |
| `/tracking` | Tracking | ✅ Yes | Appointment tracking |
| `/profile` | Profile | ✅ Yes | User profile |
| `*` | NotFound | ❌ No | 404 page |

### Page Descriptions

#### 1. **Index.tsx** - Home Page
**Sections**:
- Header (navigation)
- HeroSection - Main headline with CTA
- ProblemSection - Problem statement
- SolutionSection - Solution features
- StatsSection - Key statistics
- CTASection - Call-to-action buttons
- Footer

#### 2. **Auth.tsx** - Authentication Page (425 lines)
**Features**:
- Sign In / Sign Up toggle modes
- Aadhar number input (12-digit validation)
- Password setup (for signup with confirmation)
- CAPTCHA verification (randomly generated 5-char code)
- OTP verification (SMS/Email options)
- OTP countdown timer (resend after 30 seconds)
- Password visibility toggle
- Error handling and validation
- Automatic redirect if already authenticated

**Flow**:
1. Enter Aadhaar number
2. Verify CAPTCHA
3. Send OTP via SMS or Email
4. Verify OTP (use `123456` for demo)
5. (For signup) Create password
6. Redirect to dashboard

#### 3. **Dashboard.tsx** - Analytics Dashboard
**Displays**:
- Stat Cards:
  - Total bookings
  - Completed updates
  - Frauds prevented
  - Average wait time
- Charts:
  - Monthly demand forecast (DemandChart)
  - Center load distribution (CenterLoadCard)
  - Hourly load distribution (HourlyLoadChart)
  - Risk level breakdown (RiskPieChart)

#### 4. **BookSlot.tsx** - Booking Flow (517 lines)
**Multi-step process**:
1. **Update Type Selection** - Choose biometric, address, phone, email, or online update
2. **Face Scan Verification** - Biometric verification for certain update types
3. **Center Selection** - Choose Aadhaar center (optional for biometric)
4. **Slot Selection** - Pick appointment time
5. **Confirmation** - Review and confirm booking
6. **Online Flow** - Document upload for online updates

**Smart Features**:
- AI auto-assignment for biometric updates
- Face scan verification using device camera
- Real-time center load display
- Risk-based slot recommendations
- Auto-redirect based on update type

#### 5. **FraudAnalytics.tsx** - Security Analytics
**Displays**:
- Security metrics:
  - 85% fraud reduction
  - 99.9% system uptime
- Security features:
  - Zero-trust architecture
  - Risk classification
  - Multi-factor authentication
  - Real-time monitoring
  - Consent management
  - Audit logging
- Fraud comparison chart

#### 6. **Tracking.tsx** - Appointment Tracking (487 lines)
**Features**:
- Search appointments by ID
- View appointment history with status:
  - Scheduled
  - Completed
  - In-review
  - Cancelled
- Update history with:
  - Old/new values
  - Status (approved/pending)
  - URN (Unique Reference Number)
- Statistics (upcoming, completed, cancelled)
- Refresh tracking data

#### 7. **Profile.tsx** - User Profile (344 lines)
**Displays**:
- Personal information (name, email, phone, Aadhaar)
- Address and age
- Biometric update alert (if needed)
- Auto-booked appointment notification
- Scheduled appointments list
- Completed appointments history
- Edit profile option
- Logout button

---

## 🧩 Component Architecture

### Authentication Components

**ProtectedRoute.tsx**
- Guards routes against unauthenticated access
- Redirects to `/auth` if not authenticated

**SecurityGate.tsx**
- Re-verification gate before sensitive operations
- Two modes: password or OTP verification
- Used to protect sensitive booking/profile operations

**CaptchaInput.tsx**
- Visual CAPTCHA display
- User input validation
- Regenerate button

### Booking Components

**UpdateTypePicker.tsx**
- Display available update types
- Show descriptions and risk levels
- Differentiate between:
  - Biometric updates (auto-assigned slots)
  - Standard updates (manual slot selection)
  - Online updates (document-based)

**CenterPicker.tsx**
- Display available Aadhaar centers
- Show center location and state
- Display current load vs capacity
- Show load status (Available/Moderate/Very Busy)
- Progress bar for capacity utilization

**SlotPicker.tsx**
- Display available time slots
- Show availability count
- Display risk level (Low/Medium/High)
- Sort by risk and availability

**BookingConfirmation.tsx** (373 lines)
- Display booking details
- Generate unique booking ID
- Send SMS confirmation (auto on mount if enabled)
- Send email confirmation
- Download booking pass as PDF
- Share booking details
- Schedule appointment reminders

**FaceScanVerification.tsx**
- Camera-based face capture
- Biometric verification UI
- Liveness detection
- Upload and process face image

**OnlineUpdateFlow.tsx**
- Document upload interface
- Document type selection
- File validation
- Submission and processing

### Dashboard Components

**DemandChart.tsx**
- Monthly demand forecast
- Actual vs predicted comparison
- Capacity line indicator
- Recharts visualization

**CenterLoadCard.tsx**
- Current center occupancy
- Load percentage
- Capacity utilization
- Status indicators

**HourlyLoadChart.tsx**
- Hourly demand distribution
- Peak hours visualization
- Load forecasting

**RiskPieChart.tsx**
- Risk level distribution
- Low/Medium/High breakdown
- Color-coded segments

### Layout Components

**Header.tsx**
- Fixed navigation bar
- Logo and branding
- Navigation links:
  - Home
  - Dashboard
  - Book Slot
  - Tracking
  - Security
  - Profile
- Mobile menu toggle
- Language selector
- Logout button
- Active route highlighting

**Footer.tsx**
- Footer information
- Links and resources
- Company info

---

## 📊 Data Models

### Center
```typescript
Center {
  id: string;
  name: string;
  city: string;
  state: string;
  capacity: number;
  currentLoad: number;
  predictedLoad: number;
  coordinates: { lat: number; lng: number };
}
```

**Mock Centers**: 6 centers across India (Delhi, Mumbai, Bangalore, Chennai, Kolkata, Hyderabad)

### TimeSlot
```typescript
TimeSlot {
  id: string;
  time: string;
  available: number;
  total: number;
  riskLevel: 'low' | 'medium' | 'high';
}
```

**Available Slots**: 8 hourly slots from 9 AM to 6 PM

### UpdateType
```typescript
UpdateType {
  id: string;
  name: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high';
  requiresVerification: boolean;
  estimatedTime: string;
  isBiometric?: boolean;        // AI auto-assigns slot
  canDoOnline?: boolean;        // Online document verification
  requiredDocuments?: string[]; // Required documents
}
```

### DemandForecast
```typescript
DemandForecast {
  date: string;
  predicted: number;
  actual?: number;
  capacity: number;
}
```

**Data**: 12 months of forecast + 7-day weekly forecast

### BookingStats
```typescript
BookingStats {
  totalBookings: number;
  completedUpdates: number;
  fraudPrevented: number;
  avgWaitTime: number;
  satisfactionRate: number;
}
```

---

## 🔐 Security Features

### Multi-Factor Authentication
1. **Aadhaar Number Verification** - 12-digit validation
2. **CAPTCHA Verification** - Visual code validation
3. **OTP Verification** - SMS/Email options
4. **Password-Based Authentication** - For signup
5. **Security Gate** - Re-verification for sensitive operations

### Risk Classification
- **Low Risk**: Standard updates, available slots
- **Medium Risk**: Moderate center load
- **High Risk**: Very busy slots, peak hours

### Fraud Prevention
- 85% fraud reduction target
- Zero-trust architecture
- Real-time transaction monitoring
- Consent-based authorization
- Complete audit logging

### Data Protection
- User context isolation
- Authentication state management
- Secure session handling
- Protected routes

---

## 🌍 Internationalization (i18n)

**Translation Keys** in `translations.ts`:
- Auth related: `auth.*`
- Navigation: `nav.*`
- Hero section: `hero.*`
- Dashboard: `dashboard.*`
- Booking: `booking.*`
- Fraud: `fraud.*`
- Profile: `profile.*`
- Footer: `footer.*`

**Example Usage**:
```tsx
const { t } = useLanguage();
<h1>{t('hero.title1')}</h1>
```

**Supported Languages**: English, Telugu, Hindi

---

## 🚀 Key Features

### Smart Scheduling
- **AI Auto-Assignment**: Automatically assign optimal slots for biometric updates
- **Load Balancing**: Distribute appointments based on center capacity
- **Risk-Based Routing**: Route users to low-risk slots when available
- **Demand Forecasting**: Predict peak hours and manage capacity

### Appointment Management
- **Multi-step Booking**: Guided booking experience
- **Real-time Availability**: Current center load and capacity
- **Appointment Tracking**: View complete history
- **Status Updates**: Track appointment progress
- **Reminders**: SMS/Email notifications

### Biometric Management
- **Age-Based Milestones**: Track required update ages
- **Auto-Detection**: Alert users when biometric update is needed
- **Face Verification**: Biometric authentication
- **Auto-Booking**: System auto-books optimal appointment

### Online Updates
- **Document Verification**: Upload documents for updates
- **No Center Visit**: Complete updates online
- **Quick Processing**: Faster approval

### User Experience
- **Responsive Design**: Mobile-first approach
- **Dark/Light Mode**: Theme support
- **Smooth Animations**: Framer Motion transitions
- **Multi-language**: 3 language support
- **Real-time Feedback**: Toast notifications

---

## 📦 Dependencies

### Core Dependencies
- `react` (18.3.1) - UI library
- `react-dom` (18.3.1) - React DOM rendering
- `react-router-dom` (6.30.1) - Routing
- `typescript` (5.8.3) - Type safety

### UI & Styling
- `tailwindcss` (3.4.17) - CSS framework
- `@radix-ui/*` (various) - Accessible components
- `lucide-react` (0.462.0) - Icons
- `framer-motion` (12.26.2) - Animations

### Forms & Validation
- `react-hook-form` (7.61.1) - Form management
- `@hookform/resolvers` (3.10.0) - Validation resolvers
- `zod` (3.25.76) - Schema validation

### Data & Visualization
- `recharts` (2.15.4) - Charts and graphs
- `@tanstack/react-query` (5.83.0) - Data fetching

### Other
- `sonner` (1.7.4) - Toast notifications
- `date-fns` (3.6.0) - Date manipulation
- `embla-carousel-react` (8.6.0) - Carousel
- `next-themes` (0.3.0) - Theme provider

---

## 🛠️ Build & Development

### Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run build:dev    # Build in development mode
npm run lint         # Run ESLint
npm run preview      # Preview production build
npm run test         # Run tests once
npm run test:watch   # Run tests in watch mode
```

### Development Server
- **Port**: 8080
- **Host**: `::`
- **HMR**: Disabled overlay
- **Hot Reload**: Enabled

---

## 📝 Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Dependencies, scripts, project metadata |
| `tsconfig.json` | TypeScript compiler options |
| `vite.config.ts` | Vite build configuration, path aliases |
| `tailwind.config.ts` | Tailwind CSS theme and plugins |
| `postcss.config.js` | PostCSS processors (Tailwind, Autoprefixer) |
| `eslint.config.js` | Linting rules and configurations |
| `vitest.config.ts` | Unit testing configuration |
| `index.html` | HTML entry point |

---

## 🎯 User Flows

### Authentication Flow
```
User visits /auth
    ↓
Enter Aadhaar number (12 digits)
    ↓
Verify CAPTCHA
    ↓
Send OTP (SMS/Email)
    ↓
Enter OTP
    ↓
[If Signup] Set password
    ↓
Redirect to /dashboard
```

### Booking Flow
```
User visits /book-slot
    ↓
Select Update Type
    ↓
[If Biometric] Face Scan Verification
    ↓
[If Biometric] Auto-assign slot → Confirmation
    ↓
[If Manual] Select Center
    ↓
[If Manual] Select Time Slot
    ↓
Review Booking
    ↓
Send SMS/Email Confirmation
    ↓
Download Pass or Share
    ↓
View in Tracking
```

### Profile Workflow
```
User visits /profile
    ↓
View Personal Information
    ↓
[If Biometric Due] See Alert
    ↓
[If Auto-Booking] See Pending Appointment
    ↓
View Appointment History
    ↓
Click Edit or Logout
```

---

## 🔗 Integration Points

### Backend APIs (Not yet implemented)
Placeholders in `database/`:
- `API_ENDPOINTS.md` - Endpoint specifications
- `BACKEND_SETUP.md` - Backend setup guide
- `schema.sql` - Database schema

### External Services (Simulated)
- **OTP Delivery**: Twilio SMS/Email (currently mocked)
- **Face Recognition**: Face verification API (mocked)
- **Email Service**: Confirmation emails (mocked)
- **Document Storage**: File upload service (mocked)

---

## 🧪 Testing

### Test Setup
- **Framework**: Vitest
- **Library**: @testing-library/react
- **Configuration**: `vitest.config.ts`
- **Setup File**: `src/test/setup.ts`
- **Example Tests**: `src/test/example.test.ts`

---

## 🚨 Error Handling

### Authentication Errors
- Invalid Aadhaar number (not 12 digits)
- Password mismatch (signup)
- Invalid OTP
- Invalid CAPTCHA
- Network timeout during login

### Booking Errors
- No centers available
- No time slots available
- Face scan verification failed
- Invalid document for online update

### General Errors
- Route not found (404)
- Authentication required
- Permission denied
- Server errors

---

## 📱 Responsive Design

### Breakpoints (Tailwind CSS)
- **Mobile**: Default (< 640px)
- **Small**: `sm:` (640px+)
- **Medium**: `md:` (768px+)
- **Large**: `lg:` (1024px+)
- **Extra Large**: `xl:` (1280px+)

### Mobile-First Approach
- Components designed for mobile first
- Progressive enhancement for larger screens
- `use-mobile` hook for device detection
- Responsive navigation menu

---

## 📄 Additional Documentation

- `README.md` - Project overview and setup
- `database/BACKEND_SETUP.md` - Backend configuration
- `database/API_ENDPOINTS.md` - API specifications
- `database/schema.sql` - Database structure

---

## 🎨 UI Design System

### Design Tokens
- **Theme**: Light and dark mode support
- **Colors**: Primary, secondary, destructive, success, warning
- **Typography**: Multiple heading levels, body text
- **Spacing**: Tailwind CSS spacing scale
- **Shadows**: Card and elevation shadows
- **Radius**: Rounded corners (xl, lg, md, sm)

### Component Library
- **shadcn-ui**: 40+ reusable components
- **Accessibility**: ARIA labels, keyboard navigation
- **Animations**: Framer Motion transitions
- **Responsive**: Mobile-first responsive design

---

## 🔄 State Management Strategy

### Context API Usage
- **AuthContext**: Global authentication state
- **UserContext**: User profile and appointments
- **LanguageContext**: Language preference

### Local Component State
- Form inputs
- UI toggles (modals, menus, etc.)
- Loading states
- Error messages

### Data Fetching
- **React Query**: Could be integrated for server state
- Currently using mock data from `mockData.ts`

---

## 🎯 Performance Optimizations

### Code Splitting
- Page-based code splitting with React Router
- Lazy loading for components

### Animations
- Framer Motion for smooth transitions
- GPU-accelerated animations
- Minimal repaints

### Styling
- Tailwind CSS purging (optimized builds)
- CSS-in-JS eliminated for performance

### Bundle Size
- Tree-shaking enabled
- Dead code elimination
- Vite optimizations

---

## 🔐 Security Considerations

### Frontend Security
- No sensitive data in localStorage (demo only)
- HTTPS enforcement recommended
- CSRF protection via backend
- XSS prevention through React escaping

### Authentication
- OTP-based verification
- CAPTCHA validation
- Password hashing (backend responsibility)
- Session timeout

### Data Protection
- User context isolation
- No API keys in client code
- Secure cookie handling (backend)

---

## 📚 Code Quality

### Linting
- ESLint with React and TypeScript support
- ESLint plugin for React hooks
- ESLint refresh plugin for Vite

### TypeScript
- Strict type checking enabled
- Full type coverage
- No `any` types used

### Testing
- Vitest for unit tests
- @testing-library for component testing
- Ready for integration tests

---

## 🚀 Deployment

### Build Output
- Optimized production bundle
- Static file serving ready
- CORS headers configurable

### Hosting Options
- Vercel (recommended for Vite + React)
- Netlify
- AWS S3 + CloudFront
- Docker containerization

### Environment Variables
- `.env.development` - Development environment
- `.env.production` - Production environment

---

## 📞 Support & Maintenance

### Logging
- Console logs for debugging
- Error boundaries (recommended to add)
- Error tracking ready (Sentry integration possible)

### Monitoring
- Performance metrics
- User session tracking
- Error rate monitoring

---

## 🔮 Future Enhancements

### Planned Features
1. Backend API integration
2. Real OTP service integration
3. Face recognition API integration
4. Payment gateway for premium features
5. Appointment reminders via push notifications
6. Advanced analytics and reporting
7. Admin dashboard
8. User feedback system
9. Chatbot support
10. Mobile app version

### Technology Upgrades
- React Server Components
- Next.js migration (optional)
- GraphQL API integration
- WebSocket for real-time updates
- Service Worker for offline support

---

## 📄 License & Credits

- Built with Lovable.dev
- Uses open-source libraries (see package.json)
- Designed for UIDAI Aadhaar update platform

---

**Last Updated**: February 19, 2026
**Status**: Active Development
