# Overview

This is a modern WhatsApp bot management dashboard built with Next.js that provides a sleek, glassmorphism-styled interface for managing WhatsApp bot sessions. The application serves as a frontend interface for pairing WhatsApp numbers, managing active sessions, and handling user blocking/unblocking functionality. It features a beautiful dark theme with pink and blue accents inspired by modern web design trends.

**Status**: ✅ **Fully Functional** - GitHub import successfully configured for Replit environment with all features working perfectly.

**Live Stats**: Currently managing **148 active WhatsApp sessions** with real-time monitoring and admin controls.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: Next.js 14+ with App Router architecture
- **Styling**: Custom CSS with glassmorphism design system using CSS variables
- **Component Structure**: Modular React components with TypeScript support
- **State Management**: React hooks for local state management with custom hooks for shared logic
- **Responsive Design**: Mobile-first approach with modern CSS Grid and Flexbox layouts

## Backend Integration
- **API Architecture**: RESTful API endpoints using Next.js API routes as proxy layer
- **Proxy Pattern**: All API calls are proxied through Next.js to a backend service running on Railway
- **Authentication**: Cookie-based authentication for admin features with session management
- **Error Handling**: Comprehensive error handling with user-friendly toast notifications

## Core Features
- **Phone Number Management**: Smart country detection with international phone number validation
- **Session Management**: Real-time session monitoring with auto-refresh capabilities
- **User Blocking**: Admin-level user blocking and unblocking functionality
- **Toast Notifications**: Custom toast system for user feedback and error handling
- **Mobile Responsive**: Fully responsive design optimized for all device sizes

## Data Flow
- **Client-Server Communication**: Frontend makes requests to Next.js API routes which proxy to external backend
- **Real-time Updates**: Polling-based updates for session data with configurable intervals
- **Form Validation**: Client-side validation with comprehensive phone number parsing
- **Loading States**: Proper loading indicators and error states throughout the application

## Design System
- **Color Palette**: Deep black backgrounds with pink and blue accent colors
- **Typography**: Inter and Space Grotesk fonts for modern readability
- **Animations**: Smooth CSS transitions with cubic-bezier timing functions
- **Glass Effects**: Backdrop blur and transparency effects for modern aesthetic
- **Icon System**: Font Awesome icons for consistent visual language

# External Dependencies

## Core Dependencies
- **Next.js**: React framework for production with App Router
- **React 19**: Latest React version for component architecture
- **TypeScript**: Type safety and developer experience enhancement

## Styling & UI
- **CSS Variables**: Custom design system with extensive color and spacing tokens
- **Font Awesome**: Icon library for consistent iconography
- **Google Fonts**: Inter and Space Grotesk fonts for typography

## Backend Integration
- **Railway Backend**: External WhatsApp bot service hosted on Railway platform
- **Proxy Configuration**: Next.js API routes proxy requests to `tramway.proxy.rlwy.net:12332`
- **Cookie Authentication**: Session-based authentication for admin features

## Deployment
- **Vercel Platform**: Optimized for Vercel deployment with serverless functions
- **Environment Variables**: Configurable backend URL through environment variables
- **CORS Configuration**: Proper headers for cross-origin requests

## Development Tools
- **TypeScript Configuration**: Strict type checking with path aliases
- **ESLint**: Code linting and formatting standards
- **Vercel CLI**: Deployment and development tooling