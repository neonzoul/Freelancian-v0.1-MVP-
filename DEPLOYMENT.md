# Deployment Guide

## Production Deployment on Vercel

### Prerequisites

1. **Database Setup**: Set up a PostgreSQL database using one of these providers:
   - [Neon](https://neon.tech/) (Recommended)
   - [Supabase](https://supabase.com/)
   - [Railway](https://railway.app/)
   - [PlanetScale](https://planetscale.com/)

2. **Vercel Account**: Create an account at [vercel.com](https://vercel.com)

### Step 1: Database Setup (Neon Example)

1. Go to [Neon Console](https://console.neon.tech/)
2. Create a new project
3. Copy the connection string (it looks like):
   ```
   postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```

### Step 2: Deploy to Vercel

1. **Connect Repository**:
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login to Vercel
   vercel login
   
   # Deploy
   vercel
   ```

2. **Set Environment Variables** in Vercel Dashboard:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `NEXTAUTH_SECRET`: Generate a secure secret (32+ characters)
   - `NEXTAUTH_URL`: Your Vercel app URL (e.g., https://your-app.vercel.app)
   - `NODE_ENV`: `production`

3. **Configure Build Settings**:
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

### Step 3: Database Migration

After deployment, the build script will automatically:
1. Switch to production schema (PostgreSQL)
2. Generate Prisma client
3. Push schema to database

### Environment Variables Reference

```bash
# Required for Production
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"
NEXTAUTH_SECRET="your-super-secure-secret-key-here"
NEXTAUTH_URL="https://your-app.vercel.app"
NODE_ENV="production"
```

### Vercel Configuration

The `vercel.json` file includes:
- Framework detection
- Function timeout settings
- Environment variable mapping
- Build optimization

### Manual Database Setup (if needed)

If automatic migration fails:

```bash
# Set production environment variables locally
export DATABASE_URL="your-postgresql-url"

# Run production deployment script
npm run deploy:prod

# Or manually:
npx prisma db push
npx prisma generate
```

## Development Setup

### Local Development

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Setup Development Database**:
   ```bash
   npm run deploy:dev
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```

### Environment Files

- `.env.development`: Development environment (SQLite)
- `.env.production`: Production reference (PostgreSQL)
- `.env`: Current environment (auto-detected)

## Database Schemas

- `prisma/schema.prisma`: Current active schema
- `prisma/schema.dev.prisma`: Development schema (SQLite)
- `prisma/schema.prod.prisma`: Production schema (PostgreSQL)

## Troubleshooting

### Common Issues

1. **Database Connection Error**:
   - Verify DATABASE_URL format
   - Check database server status
   - Ensure SSL mode is correct

2. **Build Failures**:
   - Check environment variables are set
   - Verify Prisma schema is valid
   - Check Node.js version compatibility

3. **Migration Issues**:
   - Run `npm run deploy:prod` manually
   - Check database permissions
   - Verify schema compatibility

### Support

For deployment issues:
1. Check Vercel deployment logs
2. Verify environment variables
3. Test database connection
4. Review build output

## Performance Optimization

The deployment includes:
- Automatic compression
- Image optimization
- Security headers
- API response caching
- Bundle optimization

## Monitoring

Consider adding:
- Error tracking (Sentry)
- Performance monitoring (Vercel Analytics)
- Database monitoring (provider dashboard)
- Uptime monitoring