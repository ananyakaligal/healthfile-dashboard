# HealthFile Dashboard# HealthFile admin dashboard



A self-hosted health file management system built with Next.js and Nextcloud. This open-source solution provides secure, affordable, and accessible patient file management for healthcare facilities.*Automatically synced with your [v0.app](https://v0.app) deployments*



## 🎯 Project Overview[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/ananyakaligal81-gmailcoms-projects/v0-health-file-admin-dashboard)

[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/jjuxEmLWMdc)

HealthFile Dashboard is a full-stack web application that allows healthcare providers to manage patient records and files securely. It uses Nextcloud (open-source file storage) as the backend, eliminating the need for expensive commercial cloud services while maintaining complete data sovereignty.

## Overview

### Key Features

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).

- 📁 **Patient File Management** - Upload, view, and organize patient documentsAny changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

- 👥 **Patient Database** - Store and manage patient information (demographics, medical history, allergies)

- 🔒 **Secure & Private** - Self-hosted solution with app password authentication## Deployment

- 💰 **Cost-Effective** - Free and open-source (save 90% vs. commercial alternatives)

- 🐳 **Containerized** - Easy deployment with DockerYour project is live at:

- 🎨 **Modern UI** - Clean, responsive interface built with React and Tailwind CSS

**[https://vercel.com/ananyakaligal81-gmailcoms-projects/v0-health-file-admin-dashboard](https://vercel.com/ananyakaligal81-gmailcoms-projects/v0-health-file-admin-dashboard)**

---

## Build your app

## 🏗️ Architecture

Continue building your app on:

### Technology Stack

**[https://v0.app/chat/jjuxEmLWMdc](https://v0.app/chat/jjuxEmLWMdc)**

**Frontend:**

- Next.js 16 (React framework with API routes)## How It Works

- TypeScript (type safety)

- Tailwind CSS (utility-first styling)1. Create and modify your project using [v0.app](https://v0.app)

- shadcn/ui (pre-built components)2. Deploy your chats from the v0 interface

- Lucide React (icons)3. Changes are automatically pushed to this repository

4. Vercel deploys the latest version from this repository

**Backend:**
- Next.js API Routes (BFF proxy pattern)
- WebDAV protocol (for Nextcloud file operations)
- Nextcloud (file storage server)
- MariaDB (database for Nextcloud metadata)

**Infrastructure:**
- Docker & Docker Compose (containerization)
- Nginx (reverse proxy, CORS handling)

### System Architecture

```
User Browser (localhost:3000)
    ↓ HTTP
Next.js Application Server
    ├─ Frontend (React UI)
    └─ Backend (API Routes - /api/webdav/*)
        ↓ WebDAV (PROPFIND, PUT, MKCOL)
Nginx Reverse Proxy (localhost:8080)
    ↓ [adds CORS headers]
Nextcloud File Server (Docker)
    ↓ SQL queries
MariaDB Database (Docker)
```

**Data Flow:**
1. User interacts with dashboard UI
2. UI calls Next.js API routes (e.g., `/api/webdav/list`)
3. API routes make WebDAV requests to Nextcloud (via Nginx proxy)
4. Nextcloud stores files and queries MariaDB for metadata
5. Response flows back through the stack to display in UI

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm/pnpm
- **Docker Desktop** (for running Nextcloud stack)
- **Git** (to clone the repository)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ananyakaligal/healthfile-dashboard.git
   cd healthfile-dashboard
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Start Nextcloud (Docker stack):**
   ```bash
   cd infra/nextcloud
   docker-compose up -d
   ```
   
   Wait ~30 seconds for Nextcloud to initialize. Verify it's running:
   - Open http://localhost:8080
   - Login: `admin` / `admin`

4. **Configure environment variables:**
   
   Create `.env.local` in the project root:
   ```env
   NEXTCLOUD_URL=http://localhost:8080/remote.php/dav/files/admin/
   NEXTCLOUD_USER=admin
   NEXTCLOUD_APP_PASSWORD=PdYXt-3di5x-Dazkb-iJJrt-DewBd
   ```

5. **Seed patient data (optional):**
   ```bash
   # Create patient folders in Nextcloud
   node scripts/add-patients.js
   
   # Add metadata to patient folders
   node scripts/seed-patient-metadata.js
   ```

6. **Start the Next.js development server:**
   ```bash
   npm run dev
   ```

7. **Access the dashboard:**
   - Open http://localhost:3000
   - Navigate using the sidebar (Dashboard, Patients, File Manager, Settings)

---

## 📂 Project Structure

```
healthfile-dashboard/
├── app/                          # Next.js 16 app directory
│   ├── api/                      # Server-side API routes
│   │   └── webdav/              # WebDAV proxy endpoints
│   │       ├── list/            # List patient folders
│   │       ├── upload/          # Upload files
│   │       └── create-folder/   # Create patient folders
│   ├── page.tsx                 # Main dashboard component
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Global styles
├── components/                   # Reusable UI components
│   ├── ui/                      # shadcn/ui components
│   └── theme-provider.tsx       # Dark mode support
├── lib/                         # Utility libraries
│   ├── webdav.ts                # WebDAV client for Nextcloud
│   └── utils.ts                 # Helper functions
├── infra/                       # Infrastructure configuration
│   └── nextcloud/
│       ├── docker-compose.yml   # Nextcloud stack definition
│       └── nginx.conf           # Nginx reverse proxy config
├── scripts/                     # Utility scripts
│   ├── add-patients.js          # Seed patient folders
│   └── seed-patient-metadata.js # Add patient metadata
├── public/                      # Static assets
├── .env.local                   # Environment variables (create this)
├── package.json                 # Node.js dependencies
├── tsconfig.json                # TypeScript configuration
└── README.md                    # This file
```

---

## 🔑 Key Concepts

### WebDAV Protocol
WebDAV (Web Distributed Authoring and Versioning) extends HTTP for file operations. Used for:
- **PROPFIND** - List folders and files
- **PUT** - Upload files
- **MKCOL** - Create folders

### BFF Proxy Pattern
Next.js API routes act as a Backend-for-Frontend (BFF) proxy:
- **Why?** Browsers can't directly call Nextcloud (CORS restrictions)
- **How?** UI → API Routes → Nextcloud (server-to-server is allowed)
- **Benefits:** Hides credentials, adds security layer, avoids CORS errors

### Patient Metadata Storage
Patient details are stored as `patient-info.json` in each patient's Nextcloud folder:
```json
{
  "fullName": "David Johnson",
  "email": "david.johnson@example.com",
  "phone": "07700900345",
  "dob": "1975-03-12",
  "gender": "Male",
  "bloodType": "O+",
  "address": "10 Downing Street, London, SW1A 2AA",
  "allergies": "Penicillin",
  "medicalHistory": "Seasonal Asthma"
}
```

---

## 🛠️ Development

### Running Locally

**Terminal 1 - Nextcloud:**
```bash
cd infra/nextcloud
docker-compose up
```

**Terminal 2 - Dashboard:**
```bash
npm run dev
```

### Common Tasks

**Add a new patient via UI:**
1. Go to Patients tab
2. Click "Add Patient"
3. Fill in details
4. Folder + metadata automatically created in Nextcloud

**Upload files:**
1. Go to Dashboard
2. Select patient from dropdown
3. Choose file
4. Click Upload

**View Nextcloud files directly:**
- Open http://localhost:8080
- Login: `admin` / `admin`
- Navigate to Files to see patient folders

### Troubleshooting

**Issue: Docker containers won't start**
- Ensure Docker Desktop is running
- Check ports 8080 and 3306 aren't in use
- Run: `docker-compose down` then `docker-compose up`

**Issue: 502 errors in API calls**
- Verify app password in `.env.local` matches Nextcloud
- Check Nextcloud is accessible at http://localhost:8080
- Restart Next.js dev server

**Issue: CORS errors**
- Ensure requests go through API routes (not direct to Nextcloud)
- Check `nginx.conf` includes CORS headers
- Restart Nginx: `docker-compose restart proxy`

**Issue: Patient data not persisting**
- Verify `patient-info.json` exists in Nextcloud folders
- Check `scripts/seed-patient-metadata.js` ran successfully
- Ensure `createPatientFolder()` is called with metadata

---

## 🚢 Deployment

### Local Development (Current)
- **Cost:** $0
- **Access:** localhost only
- **Use:** Development, testing, demos

### Option 1: Cloud VPS (Recommended)
**Platforms:** DigitalOcean, AWS EC2, Linode

**Steps:**
1. Rent a virtual server ($12-20/month)
2. Install Docker and Docker Compose
3. Clone repository and run:
   ```bash
   docker-compose up -d
   npm run build
   npm start
   ```
4. Configure domain and SSL (Let's Encrypt)

**Pros:** Full control, affordable, scalable  
**Cons:** Requires server management

### Option 2: Managed Services
**Nextcloud:** Use managed hosting (~€10/month)  
**Next.js:** Deploy to Vercel (free tier or ~$20/month)

**Pros:** No infrastructure management, auto-scaling  
**Cons:** Higher cost, less control

### Option 3: Kubernetes (Enterprise)
**Platforms:** AWS EKS, Google GKE

**Pros:** Highly scalable, fault-tolerant  
**Cons:** Complex, expensive ($100+/month)

### Production Checklist
- [ ] Change default passwords (admin/admin)
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure firewall rules
- [ ] Set up automated backups (Docker volumes)
- [ ] Enable Nextcloud server-side encryption
- [ ] Add monitoring and logging
- [ ] Use environment-specific `.env` files
- [ ] Configure CORS for your domain only

---

## 📊 Cost Comparison

| Solution | Monthly Cost | Notes |
|----------|-------------|-------|
| **HealthFile Dashboard (Self-Hosted)** | $15-20 | Cloud VPS + domain |
| **HealthFile Dashboard (Local)** | $0 | Development only |
| Google Workspace Business | $600 | 50 users × $12/user |
| AWS S3 + EC2 | $50-100 | Comparable setup |
| Enterprise Healthcare Software | $10,000+ | Per facility license |

**Savings:** 90%+ vs. commercial alternatives

---

## 🔒 Security Considerations

### Current Implementation
- ✅ App passwords (limited scope, revocable)
- ✅ Server-side proxy (credentials hidden from browser)
- ✅ Docker network isolation
- ✅ Persistent volumes for data safety

### Production Enhancements
- 🔐 Enable HTTPS/SSL (Let's Encrypt)
- 🔐 Use strong passwords (change from admin/admin)
- 🔐 Configure firewall (restrict ports)
- 🔐 Enable Nextcloud encryption
- 🔐 Add multi-user authentication (OAuth, LDAP)
- 🔐 Implement role-based access control
- 🔐 Set up audit logs
- 🔐 Regular backups and disaster recovery

### Compliance
This setup supports:
- **HIPAA** - Self-hosted, encrypted storage
- **GDPR** - Data sovereignty, user control
- **Local regulations** - No third-party data sharing

*Note: Consult legal/compliance experts for production healthcare use.*

---

## 🤝 Contributing

This is an educational project. Contributions are welcome!

### How to Contribute
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open-source and available under the MIT License.

---

## 🙏 Acknowledgments

- **Nextcloud** - Open-source file storage platform
- **Next.js** - React framework by Vercel
- **shadcn/ui** - Beautifully designed components
- **Docker** - Containerization platform

---

## 📞 Support

- **Issues:** https://github.com/ananyakaligal/healthfile-dashboard/issues
- **Discussions:** https://github.com/ananyakaligal/healthfile-dashboard/discussions

---

## 🎓 Educational Context

This project demonstrates:
- Full-stack web development (React, Next.js, TypeScript)
- Containerization and microservices (Docker, Docker Compose)
- API design (REST, WebDAV)
- Self-hosting and open-source alternatives
- Healthcare IT concepts (patient records, secure storage)
- DevOps practices (CI/CD, deployment)

Perfect for learning modern web development with real-world healthcare applications!

---

**Built with ❤️ for accessible healthcare technology**
