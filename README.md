# 🗳️ CampusVote - College Voting System

A secure, transparent, and user-friendly online voting platform designed specifically for college campuses. CampusVote eliminates the challenges of traditional offline voting systems while ensuring electoral integrity and accessibility.

## ✨ Features

### 🔐 Security & Authentication
- **JWT-based Authentication** with secure token management
- **OTP Verification** via email for account activation
- **Multi-factor Security** with password hashing and validation
- **Role-based Access Control** (Voter, Admin, Candidate)
- **Rate Limiting** and security middleware protection

### 🗳️ Voting System
- **One Vote Per User** with duplicate prevention
- **Real-time Vote Counting** and live results
- **End-to-end Encryption** for vote integrity
- **Audit Logs** for complete transparency
- **Vote Verification** with cryptographic hashing

### 📍 Booth Management
- **Smart Booth Assignment** based on department and year
- **Location Services** with building and room details
- **Capacity Management** and occupancy tracking
- **Staff Assignment** for booth supervision

### 👥 User Management
- **Student Registration** with ID verification
- **Admin Approval System** for new registrations
- **Profile Management** and updates
- **Branch & Year-based** access control

### 📊 Admin Dashboard
- **Candidate Management** and approval
- **Voter Verification** and approval
- **Election Analytics** and statistics
- **Real-time Monitoring** of voting process

## 🚀 Tech Stack

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Nodemailer** for email services
- **Multer** for file uploads
- **Express Validator** for input validation

### Frontend
- **React.js** with modern hooks
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Axios** for API communication
- **React Hook Form** for form management
- **React Hot Toast** for notifications
- **Lucide React** for icons

### Security Features
- **Helmet.js** for security headers
- **CORS** configuration
- **Rate Limiting** protection
- **Input Validation** and sanitization
- **File Upload** security

## 📋 Prerequisites

Before running this application, make sure you have:

- **Node.js** (v16 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **yarn** package manager
- **Email Service** credentials (Gmail, SendGrid, etc.)

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd campusvote
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install all dependencies (frontend + backend)
npm run install-all
```

### 3. Environment Configuration
Create `.env` files in both root and server directories:

#### Root `.env`
```env
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

#### Server `.env`
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/campusvote
JWT_SECRET=your-super-secret-jwt-key-here
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### 4. Database Setup
```bash
# Start MongoDB (if running locally)
mongod

# Or use MongoDB Atlas (cloud service)
# Update MONGODB_URI in .env file
```

### 5. Run the Application
```bash
# Development mode (both frontend and backend)
npm run dev

# Or run separately:
npm run server    # Backend only
npm run client    # Frontend only
```

## 🌐 Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

## 📱 Usage Guide

### For Students (Voters)

1. **Registration**
   - Visit the registration page
   - Fill in personal details and upload student ID
   - Verify email with OTP
   - Wait for admin approval

2. **Voting Process**
   - Login to your account
   - Check assigned voting booth
   - View candidate profiles and manifestos
   - Cast your vote securely
   - Receive confirmation

3. **Profile Management**
   - Update personal information
   - View voting history
   - Check booth assignments

### For Administrators

1. **User Management**
   - Approve/reject new registrations
   - Manage user roles and permissions
   - Monitor user activities

2. **Election Management**
   - Create and configure elections
   - Set voting periods and eligibility
   - Manage candidate applications

3. **Results & Analytics**
   - View real-time vote counts
   - Generate detailed reports
   - Monitor election progress

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-otp` - OTP verification
- `POST /api/auth/resend-otp` - Resend OTP
- `GET /api/auth/me` - Get current user

### Voter Operations
- `GET /api/voter/profile` - Get voter profile
- `PUT /api/voter/profile` - Update profile
- `GET /api/voter/booth` - Get booth information
- `GET /api/voter/elections` - Get available elections
- `GET /api/voter/voting-status` - Check voting status

### Admin Operations
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users/:id/approve` - Approve user
- `GET /api/admin/candidates` - Get candidates
- `POST /api/admin/candidates` - Create candidate
- `GET /api/admin/results` - Get election results

### Voting Operations
- `POST /api/voting/cast-vote` - Cast vote
- `GET /api/voting/results` - Get results
- `GET /api/voting/status` - Get voting status

## 🚨 Security Considerations

- **JWT Secret**: Use a strong, unique secret key
- **Email Credentials**: Use app passwords, not regular passwords
- **Database Access**: Restrict MongoDB access to application only
- **HTTPS**: Use HTTPS in production environments
- **Rate Limiting**: Configure appropriate rate limits
- **File Uploads**: Validate and sanitize all uploads

## 🧪 Testing

```bash
# Run frontend tests
cd client
npm test

# Run backend tests
cd server
npm test
```

## 📦 Deployment

### Frontend (Netlify)
```bash
cd client
npm run build
# Deploy build folder to Netlify
```

### Backend (Render/Vercel/Heroku)
```bash
cd server
# Configure environment variables
# Deploy to your preferred platform
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔮 Future Enhancements

- **Mobile App** development
- **Blockchain Integration** for enhanced security
- **AI-powered** fraud detection
- **Multi-language** support
- **Advanced Analytics** and reporting
- **Integration** with student management systems

## 📊 Project Status

- ✅ **Core Backend** - Complete
- ✅ **Authentication System** - Complete
- ✅ **User Management** - Complete
- ✅ **Voting System** - Complete
- ✅ **Admin Dashboard** - Complete
- ✅ **Frontend UI** - Complete
- 🔄 **Testing** - In Progress
- 🔄 **Documentation** - In Progress

---

**Built by Team TechHexa for better democracy and campus engagement**
