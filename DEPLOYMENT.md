# Deployment Guide for Vercel

This guide will help you deploy your Inventory Management System to Vercel.

## Prerequisites

1. A [Vercel account](https://vercel.com/signup)
2. A MongoDB Atlas database (or any MongoDB provider)
3. Google OAuth credentials
4. Cloudflare R2 storage configured

## Step-by-Step Deployment

### 1. Push Your Code to Git

Make sure your code is pushed to a Git repository (GitHub, GitLab, or Bitbucket):

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 2. Import Project to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import your Git repository
4. Vercel will automatically detect Next.js

### 3. Configure Environment Variables

In Vercel project settings, add the following environment variables:

#### Database Configuration
- `DATABASE_URL` - Your MongoDB connection string
  ```
  mongodb+srv://username:password@cluster.mongodb.net/database-name?retryWrites=true&w=majority
  ```

#### Authentication
- `BETTER_AUTH_SECRET` - Generate a random secret key (32+ characters)
  ```bash
  # Generate using Node.js
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- `BETTER_AUTH_URL` - Your production URL
  ```
  https://your-app-name.vercel.app
  ```

#### Google OAuth
- `GOOGLE_CLIENT_ID` - Your Google OAuth Client ID
- `GOOGLE_CLIENT_SECRET` - Your Google OAuth Client Secret

**Important:** Update your Google OAuth settings:
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Add `https://your-app-name.vercel.app` to Authorized JavaScript origins
- Add `https://your-app-name.vercel.app/api/auth/callback/google` to Authorized redirect URIs

#### Cloudflare R2 Storage
- `R2_ACCOUNT_ID` - Your Cloudflare R2 Account ID
- `R2_ACCESS_KEY_ID` - Your R2 Access Key ID
- `R2_SECRET_ACCESS_KEY` - Your R2 Secret Access Key
- `R2_BUCKET_NAME` - Your R2 Bucket Name
- `R2_PUBLIC_URL` - Your R2 Public URL (e.g., `https://pub-xxx.r2.dev`)

### 4. Configure Build Settings

Vercel should automatically detect these settings from `vercel.json`, but verify:

- **Framework Preset:** Next.js
- **Build Command:** `prisma generate && next build`
- **Install Command:** `npm install`
- **Output Directory:** `.next`

### 5. Deploy

Click "Deploy" and wait for the build to complete.

## Post-Deployment

### 1. Update BETTER_AUTH_URL

After first deployment, update the `BETTER_AUTH_URL` environment variable to your actual Vercel URL:
```
https://your-actual-app-name.vercel.app
```

Then redeploy by going to Deployments → Click "..." → "Redeploy"

### 2. Test Your Application

1. Visit your deployed URL
2. Test Google OAuth login
3. Test creating inventories
4. Test image uploads
5. Test all CRUD operations

### 3. Set Up Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS settings as instructed
4. Update `BETTER_AUTH_URL` to your custom domain
5. Update Google OAuth redirect URIs to use custom domain

## Troubleshooting

### Build Fails with Prisma Error

**Solution:** Make sure `postinstall` script is in package.json:
```json
"scripts": {
  "postinstall": "prisma generate"
}
```

### Authentication Not Working

**Solutions:**
1. Verify `BETTER_AUTH_URL` matches your deployed URL
2. Check Google OAuth redirect URIs include your Vercel URL
3. Ensure `BETTER_AUTH_SECRET` is set

### Database Connection Issues

**Solutions:**
1. Verify `DATABASE_URL` is correct
2. Check MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
3. Ensure database user has proper permissions

### Image Upload Fails

**Solutions:**
1. Verify all R2 environment variables are set correctly
2. Check R2 bucket CORS settings allow your domain
3. Ensure R2 bucket is publicly accessible

### Environment Variables Not Working

**Solution:**
1. Go to Project Settings → Environment Variables
2. Make sure variables are set for Production environment
3. Redeploy after adding/changing variables

## Monitoring

### View Logs

1. Go to your project on Vercel
2. Click on a deployment
3. Click "Functions" tab to see API logs
4. Click "Runtime Logs" to see real-time logs

### Error Tracking

Consider integrating error tracking:
- [Sentry](https://sentry.io/)
- [LogRocket](https://logrocket.com/)
- Vercel's built-in Analytics

## Performance Optimization

### Enable Vercel Analytics

1. Go to Project Settings → Analytics
2. Enable Analytics to track Web Vitals

### Enable Caching

The app already uses Next.js caching strategies. To optimize further:
- Use Vercel's Edge Network
- Enable Image Optimization (automatic with Next.js Image component)

## Security Checklist

- [ ] All environment variables are set
- [ ] `.env` is in `.gitignore`
- [ ] Google OAuth redirect URIs are restricted to your domain
- [ ] MongoDB connection string uses strong password
- [ ] R2 bucket has proper CORS configuration
- [ ] BETTER_AUTH_SECRET is strong and unique

## Updating Your Application

To deploy updates:

```bash
git add .
git commit -m "Your update message"
git push origin main
```

Vercel will automatically build and deploy your changes.

## Rollback

If something goes wrong:

1. Go to Deployments tab
2. Find the last working deployment
3. Click "..." → "Promote to Production"

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs/)
