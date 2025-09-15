# Vercel Deployment Guide

## Required Environment Variables

To deploy the WhatsApp Dashboard to Vercel successfully, you need to set these environment variables:

### 1. JWT_SECRET (Required for Production)
```
JWT_SECRET=your-strong-random-secret-here
```
**Example**: `JWT_SECRET=sk-proj-abc123xyz789very-long-random-string-here`

**Important**: Generate a strong, random 32+ character secret. You can use:
```bash
openssl rand -base64 32
```

### 2. ADMIN_PASSWORD (Required)
```
ADMIN_PASSWORD=your-secure-admin-password
```
This is the password used to access the admin panel.

### 3. BACKEND_URL (Optional)
```
BACKEND_URL=http://tramway.proxy.rlwy.net:12332
```
This defaults to the Railway backend URL, but you can change it if your backend is hosted elsewhere.

## How to Set Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add each variable with its value
5. Make sure to set them for all environments (Production, Preview, Development)

## Deployment Commands

The application is already configured for Vercel deployment with:
- Production-ready HTTPS cookies
- Secure JWT authentication
- Proper CORS configuration
- Error handling for production environment

## Troubleshooting

### Sessions Not Loading
- Verify `BACKEND_URL` is correct and accessible
- Check if the backend service is running
- Ensure CORS is properly configured

### Admin Login Errors
- Verify `JWT_SECRET` is set (required for production)
- Check `ADMIN_PASSWORD` is correct
- Ensure cookies are being set (check browser dev tools)

### Authentication Issues
- Make sure you're using HTTPS (Vercel provides this automatically)
- Check that cookies are being sent with requests
- Verify JWT_SECRET is the same across all instances

## Automatic Features

The application automatically detects Vercel environment and:
- Enables secure HTTPS cookies
- Uses production JWT secret
- Applies stricter CORS policies
- Handles errors gracefully