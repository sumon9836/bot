# 𝐊ąìʂҽղ-𝐌𝐃 | Bot Management Dashboard 🤖

A beautiful, modern WhatsApp bot management dashboard with glassmorphism design and advanced features.

## ✨ Features

- 🎨 **Modern UI**: Colorful gradients, glassmorphism effects, and smooth animations
- 📱 **WhatsApp Integration**: Pair/unpair WhatsApp numbers with your bot
- 🔐 **Secure Pairing**: Display pairing codes with copy-to-clipboard functionality  
- 📊 **Session Management**: View and manage all active bot sessions
- 🗑️ **Easy Removal**: One-click session removal with confirmation
- 📱 **Mobile Responsive**: Works perfectly on all devices
- ⚡ **Real-time Updates**: Auto-refresh sessions every 30 seconds
- 🌐 **Vercel Ready**: Optimized for Vercel deployment

## 🚀 Quick Deploy to Vercel

### 1. Clone or Fork Repository
```bash
git clone <your-repo-url>
cd kaisen-bot-dashboard
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Deploy to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# For production deployment
vercel --prod
```

### 4. Alternative: Deploy via Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will automatically detect the configuration
5. Click "Deploy"

## 📁 Project Structure

```
├── api/
│   └── index.js          # Node.js API server with proxy
├── public/
│   ├── index.html        # Main dashboard page
│   ├── styles.css        # Glassmorphism styling
│   └── script.js         # Frontend JavaScript
├── vercel.json          # Vercel deployment config
├── package.json         # Node.js dependencies
└── README.md           # This file
```

## 🔧 Configuration

The dashboard automatically proxies requests to your bot API at:
```
http://mainline.proxy.rlwy.net:35640
```

### API Endpoints:
- `GET /api/pair?number=XXXXXXXXXX` - Pair new WhatsApp number
- `GET /api/logout?number=XXXXXXXXXX` - Remove/logout WhatsApp session
- `GET /api/sessions` - Get all active sessions
- `GET /api/health` - Health check

## 💻 Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# The dashboard will be available at http://localhost:3000
```

## 🎨 Design Features

- **Colorful Gradients**: Pink, blue, yellow gradient backgrounds
- **Glass Effects**: Backdrop blur and transparency
- **Orbitron Font**: Futuristic typography for headers
- **Space Grotesk**: Clean, modern body font
- **Smooth Animations**: Hover effects and transitions
- **Mobile First**: Responsive design for all screen sizes

## 🔒 Security Features

- CORS protection
- Request rate limiting (100 requests per 15 minutes)
- Input validation and sanitization
- Error handling with user-friendly messages
- Secure proxy to external API

## 📱 Mobile Experience

The dashboard is fully responsive and provides an excellent experience on:
- 📱 Mobile phones (iOS/Android)
- 📟 Tablets
- 💻 Desktop computers
- 🖥️ Large displays

## 🛠️ Environment Variables

Create a `.env` file for local development:
```env
NODE_ENV=development
PORT=3000
API_BASE_URL=http://mainline.proxy.rlwy.net:35640
```

## 🚨 Troubleshooting

### Common Issues:
1. **CORS Errors**: The built-in proxy handles CORS automatically
2. **API Timeouts**: Requests timeout after 30 seconds
3. **Session Not Loading**: Check if your bot API is running
4. **Pairing Code Not Showing**: Verify the API response format

### Debug Mode:
Check browser console and server logs for detailed error information.

## 📊 Performance

- ⚡ **Fast Loading**: Optimized static assets
- 🔄 **Auto-refresh**: Sessions update every 30 seconds
- 💾 **Memory Efficient**: Lightweight Node.js server
- 📡 **Low Latency**: Direct API proxy without additional layers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - Feel free to use this in your own projects!

## 🎯 Deployment Status

Once deployed, your dashboard will be available at:
- **Vercel URL**: `https://your-project.vercel.app`
- **Custom Domain**: Configure in Vercel dashboard

## 📧 Support

For issues or questions, please open an issue on GitHub or contact the development team.

---

**Made with ❤️ by Kaisen-MD Team**