# EventHub Frontend

**Version 1.4**

A modern, responsive event management platform built with Next.js 13, featuring comprehensive user management, real-time notifications, multi-language support, advanced administrative capabilities, and enhanced internationalization.

## 🚀 Technology Stack

- **Framework**: Next.js 13 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **State Management**: React Context API + SWR for data fetching
- **Forms**: React Hook Form with Zod validation
- **Internationalization**: next-i18next (English, Russian, Azerbaijani)
- **UI Components**: Headless UI + Heroicons
- **HTTP Client**: Axios with interceptors
- **Animations**: Framer Motion
- **Security**: Google reCAPTCHA integration

## 📋 Core Features

### 🔐 Authentication & User Management
- **JWT-based authentication** with automatic token refresh
- **Role-based access control** with 5-tier hierarchy:
  - `User` - Basic event participation and social features
  - `Organizer` - Event creation, management, and attendee tracking
  - `Admin` - User management and system administration
  - `SeniorAdmin` - Advanced administrative functions and audit logs
  - `Owner` - Full system control and ownership transfer
- **User registration** with email verification
- **Profile management** with avatar and personal information
- **Password reset** and account recovery
- **Ownership Transfer System** with Telegram verification
- **User Impersonation** for administrative debugging
- **Preferred language** settings for internationalization

### 📅 Event Management System
- **Event browsing** with advanced filtering and search
- **Event creation** and editing for organizers and admins
- **Event categorization** with expanded categories:
  - Technology, Business, Education, Entertainment, Sports, Health
  - Conference, Workshop, Seminar, Party, Concert, Exhibition, Networking
  - Meetup, Social, Other
- **Date and time management** with timezone support
- **Location tracking** with venue information
- **Participant management** with capacity limits
- **Event status tracking** (upcoming, ongoing, completed)
- **Event ownership** and transfer capabilities
- **Event filtering** by category, date, location, and organizer

### 👥 Social Features
- **Event reactions** with emoji support and real-time counts
- **Comment system** with threaded replies and moderation
- **Comment pinning** for important announcements
- **Comment editing** with edit history tracking
- **Event bookmarking** (favorites)
- **RSVP functionality** (planned events)
- **Social interactions** tracking and analytics

### 🔔 Advanced Notification System
- **Real-time notifications** with auto-refresh (30s intervals)
- **In-app notification center** with read/unread status
- **Click to Delete** - Notifications are removed when clicked
- **Notification types**:
  - Event comments and reactions
  - Event reminders and updates
  - System announcements
  - Administrative notifications
- **Bulk operations** (mark all as read)
- **Notification preferences** and filtering
- **Notification management** with enhanced UX

### 🛡️ User Moderation System
- **User banning** with duration-based restrictions and reason tracking
- **User muting** for temporary communication restrictions with rank validation
- **Ban/mute management** with detailed logging
- **Moderation history** and audit trails
- **Appeal system** for banned users
- **Organizer blacklist** for managing banned users per organizer

### 🤖 Telegram Integration
- **Telegram account linking** for external notifications
- **Verification system** with secure code generation
- **Event reminders** sent to Telegram
- **Database access confirmation** via Telegram codes
- **Notification preferences** for Telegram alerts
- **Enhanced verification** for critical operations

### 📊 Administrative Dashboard
- **Comprehensive admin panel** with role-based access
- **User management** with bulk operations
- **Event administration** with full CRUD capabilities
- **Comment moderation** with pin/unpin functionality
- **Activity logs** with detailed audit trails and filtering
- **System statistics** and analytics
- **Database seeding** with secure access control
- **Ownership Transfer Management** with verification system
- **Enhanced Role Management** with hierarchical sorting
- **User-specific activity logs** for targeted monitoring

### 🌐 Multi-Language Support
- **Three languages**: English, Russian, Azerbaijani
- **Dynamic language switching** without page reload
- **Localized content** for all user-facing text
- **RTL support** for future language additions
- **Cultural adaptations** for different regions
- **Localized event categories** and UI strings
- **Language-specific content** delivery

### 🎨 Modern UI/UX Design
- **Dark/Light theme** with system preference detection
- **Responsive design** optimized for all devices
- **Accessibility features** (WCAG 2.1 compliant)
- **Smooth animations** and transitions
- **Loading states** and error handling
- **Toast notifications** for user feedback
- **Search focus preservation** - cursor stays in place during typing
- **Enhanced pagination** with proper button disabling
- **Minimalistic but beautiful** UI design

## 🏗️ Architecture

### Pages Structure
```
src/pages/
├── index.tsx                    # Homepage with event listings
├── login.tsx                    # User authentication
├── register.tsx                 # User registration
├── profile.tsx                  # User profile management
├── events/
│   ├── index.tsx               # Event browsing and filtering
│   ├── [id].tsx                # Individual event details
│   ├── favorites.tsx           # User's favorite events
│   └── going.tsx               # User's planned events
├── admin/
│   ├── index.tsx               # Admin dashboard
│   ├── users.tsx               # User management
│   ├── events/
│   │   ├── index.tsx           # Event administration
│   │   ├── create.tsx          # Event creation
│   │   ├── edit/[id].tsx       # Event editing
│   │   └── [id]/attendees.tsx  # Event attendees
│   ├── comments/
│   │   └── index.tsx           # Comment moderation
│   ├── user-roles.tsx          # Role management with hierarchy
│   ├── activity-logs.tsx       # Audit logs with filtering
│   ├── impersonation.tsx       # User impersonation
│   ├── transfer-ownership.tsx  # Ownership transfer system
│   └── seed-database.tsx       # Database seeding
└── organizer/
    ├── index.tsx               # Organizer dashboard
    ├── blacklist.tsx           # Organizer blacklist management
    └── events/
        ├── create.tsx          # Event creation
        ├── edit/[id].tsx       # Event editing
        └── [id]/attendees.tsx  # Event attendees
```

### Components
- **Layout Components**: `Layout.tsx`, `AdminLayout.tsx`, `Navbar.tsx`, `Footer.tsx`
- **Form Components**: `Form.tsx`, `Input.tsx`, `Button.tsx`, `TimeInput.tsx`
- **Event Components**: `EventCard.tsx`, `EventComments.tsx`, `ReactionPicker.tsx`
- **Admin Components**: `AdminTable.tsx`, `AdminUserTable.tsx`, `CommentAdminTable.tsx`
- **Modal Components**: `UserBanModal.tsx`, `UserMuteModal.tsx`, `EditUserRolesModal.tsx`, `TransferOwnershipModal.tsx`
- **Utility Components**: `LoadingSpinner.tsx`, `ThemeToggle.tsx`, `LanguageSwitcher.tsx`, `SearchInput.tsx`

### Hooks and Utilities
- **Custom Hooks**: `useAuth.ts`, `useToken.ts`, `useIsClient.ts`
- **API Integration**: `api.ts`, `axios.ts` with interceptors
- **Type Definitions**: `types.ts` with comprehensive interfaces
- **Validation**: `validations.ts` with Zod schemas

## 🔧 Configuration

### Environment Variables
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_key
```

### Localization
- **Supported languages**: English (en), Russian (ru), Azerbaijani (az)
- **Translation files**: `public/locales/{lang}/common.json`
- **Language detection**: Browser preference with fallback
- **Localized categories**: Event categories in all supported languages

### Theme Configuration
- **Dark mode**: Class-based with system preference detection
- **Color scheme**: Custom Tailwind configuration
- **Component theming**: Consistent dark/light variants

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm
- EventHub Backend API running

### Installation
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 📱 Responsive Design

### Breakpoints
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

### Mobile Optimizations
- Touch-friendly interface
- Optimized navigation for mobile
- Responsive tables and forms
- Mobile-specific interactions

## 🔒 Security Features

### Client-Side Security
- **Input validation** with Zod schemas
- **XSS prevention** with proper content encoding
- **CSRF protection** with token validation
- **Secure HTTP headers** configuration

### Authentication Security
- **JWT token management** with automatic refresh
- **Secure token storage** in memory
- **Role-based route protection**
- **Session management** with proper cleanup

## 📈 Performance Optimizations

### Data Fetching
- **SWR caching** for optimal data management
- **Background revalidation** for fresh data
- **Optimistic updates** for better UX
- **Error boundaries** for graceful failure handling

### Code Optimization
- **Dynamic imports** for code splitting
- **Image optimization** with Next.js Image component
- **Bundle analysis** and optimization
- **Tree shaking** for unused code elimination

## 🧪 Testing & Quality

### Code Quality
- **TypeScript** for type safety
- **ESLint** for code linting
- **Prettier** for code formatting
- **Husky** for pre-commit hooks

### Browser Support
- **Modern browsers** (Chrome, Firefox, Safari, Edge)
- **Progressive enhancement** for older browsers
- **Mobile browsers** optimization

## 🆕 Version 1.4 Enhancements

### 🌍 Enhanced Internationalization
- **Expanded Event Categories** - Added new categories with full localization
- **Localized UI Strings** - All interface elements properly translated
- **Category Localization** - Event categories in English, Russian, and Azerbaijani
- **Improved Language Support** - Better handling of language-specific content

### 🔄 Enhanced Ownership Transfer System
- **Telegram Verification** - Secure ownership transfer with 6-digit codes
- **Transfer Modal** - User-friendly interface for ownership transfer
- **Role Hierarchy** - Automatic role downgrade/upgrade during transfer
- **Audit Logging** - Complete tracking of ownership transfers
- **Enhanced Security** - Multiple verification steps for critical operations

### 📊 Comprehensive Activity Logging
- **Comprehensive Logs** - Track all user actions and system events
- **Advanced Filtering** - Filter logs by user, action type, date range
- **Real-time Monitoring** - Live activity tracking for administrators
- **Audit Trail** - Complete history for security and compliance
- **User-specific Logs** - Targeted monitoring for specific users
- **Export Capabilities** - Support for log data export

### 🛡️ Enhanced Security Features
- **Rank-based Restrictions** - Prevent muting users with equal or higher rank
- **Role Validation** - Enforce hierarchical role assignment rules
- **Input Validation** - Comprehensive validation for all endpoints
- **Audit Trail** - Complete security audit trail for compliance
- **Ban Reason Tracking** - Store and display reasons for user bans
- **Enhanced CORS** - Improved cross-origin resource sharing policies

### 🔧 API Improvements
- **Enhanced Error Handling** - Better error messages and status codes
- **Pagination Support** - Consistent pagination across all endpoints
- **Search Functionality** - Advanced search capabilities
- **Performance Optimization** - Improved response times and efficiency
- **Better Documentation** - Enhanced Swagger documentation
- **Consistent Response Format** - Standardized API responses

### 📱 Enhanced Telegram Integration
- **Improved Bot Functionality** - Better notification delivery
- **Enhanced Verification** - More secure verification processes
- **Better Error Handling** - Improved error management for Telegram operations
- **User Experience** - Smoother integration with the platform

### 🗄️ Database Improvements
- **Schema Optimizations** - Improved database structure
- **Index Enhancements** - Better query performance
- **Migration System** - Robust database migration management
- **Data Integrity** - Enhanced constraints and relationships

### 🎯 Improved Role Management
- **Hierarchical Sorting** - Roles displayed in priority order
- **Owner Role Protection** - Owner role excluded from manual assignment
- **Enhanced UI** - Better visual representation of role hierarchy
- **Role Validation** - Prevent assignment of roles higher than user's level

### 🔔 Enhanced Notification System
- **Click to Delete** - Notifications removed when clicked
- **Improved UX** - Better user experience with immediate feedback
- **Bulk Operations** - Mark all notifications as read
- **Real-time Updates** - Instant notification updates

### 🔍 Search & Navigation Improvements
- **Focus Preservation** - Search cursor stays in place during typing
- **Enhanced Pagination** - Proper button disabling for navigation
- **Better UX** - Improved user experience across all search interfaces

## 🌟 Key Features

### Event Management
- ✅ Create, edit, and delete events
- ✅ Advanced filtering and search
- ✅ Category-based organization with expanded categories
- ✅ Date and time management
- ✅ Location tracking
- ✅ Participant management

### User Experience
- ✅ Intuitive navigation
- ✅ Real-time updates
- ✅ Responsive design
- ✅ Accessibility support
- ✅ Multi-language interface with enhanced localization
- ✅ Dark/light themes

### Administrative Tools
- ✅ User management with enhanced moderation
- ✅ Role assignment with hierarchy validation
- ✅ Content moderation
- ✅ Activity monitoring with comprehensive logging
- ✅ System analytics
- ✅ Database management

### Social Features
- ✅ Event reactions
- ✅ Comment system with editing capabilities
- ✅ User interactions
- ✅ Notification system with enhanced UX
- ✅ Event planning

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions, please refer to the project documentation or create an issue in the repository.

## 📈 Roadmap

### Planned Features
- **Real-time WebSocket** support for live updates
- **Advanced Analytics** dashboard
- **Email Notifications** integration
- **Mobile API** optimizations
- **Advanced Search** with Elasticsearch
- **File Upload** for event images
- **Calendar Integration** (Google Calendar, Outlook)
- **Payment Integration** for paid events
