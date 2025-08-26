# WhatsApp Bot Management Dashboard

## Overview

This project is a web-based management dashboard for WhatsApp bot operations. It provides a user interface for managing WhatsApp bot sessions, including the ability to pair new phone numbers and manage existing sessions. The frontend is built with vanilla HTML, CSS, and JavaScript, communicating with a backend API service for bot management operations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Pure HTML/CSS/JavaScript**: Uses vanilla web technologies without frameworks for simplicity and lightweight deployment
- **Responsive Design**: Mobile-first approach with responsive styling using CSS Grid and Flexbox
- **Component-based Structure**: Modular design with distinct sections for pairing, deletion, and session management
- **Real-time Updates**: Dynamic DOM manipulation for session status updates and user feedback

### UI/UX Design Patterns
- **Card-based Layout**: Information organized in visually distinct cards for better user experience
- **WhatsApp Branding**: Consistent use of WhatsApp green (#25D366) and familiar iconography
- **Toast Notifications**: Non-intrusive feedback system for user actions
- **Loading States**: Visual indicators for asynchronous operations

### API Integration
- **RESTful Communication**: Frontend communicates with backend via HTTP requests to railway-hosted API
- **Error Handling**: Comprehensive error handling with user-friendly error messages
- **Phone Number Validation**: Client-side validation using regex patterns for phone number format

### Data Management
- **Session State**: Local state management for active WhatsApp bot sessions
- **Form Handling**: Event-driven form processing for pairing and deletion operations
- **Dynamic Content**: Real-time updates of session grid based on API responses

## External Dependencies

### Third-party Services
- **Railway Deployment**: Backend API hosted on Railway platform at mainline.proxy.rlwy.net:35640
- **Google Fonts**: Roboto font family for consistent typography
- **Font Awesome**: Icon library for UI elements and visual indicators

### Frontend Libraries
- **Font Awesome 6.0.0**: Provides icons for WhatsApp branding and UI elements
- **Google Fonts API**: Delivers Roboto font family with multiple weights

### Browser APIs
- **Fetch API**: For HTTP communication with backend services
- **DOM API**: For dynamic content manipulation and event handling
- **Form Validation API**: Built-in browser validation for phone number inputs