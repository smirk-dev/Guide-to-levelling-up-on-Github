# Deploying to Vercel

This guide will walk you through deploying the Code Warrior application to Vercel.

## Prerequisites

- A Vercel account (sign up at [vercel.com](https://vercel.com))
- Supabase project already set up and deployed
- GitHub OAuth App configured

## Step-by-Step Deployment

### 1. Install Vercel CLI (Optional)

```bash
npm i -g vercel
```

### 2. Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit [vercel.com/new](https://vercel.com/new)
   - Click "Add New" → "Project"

2. **Import Your Git Repository**
   - Connect your GitHub account if not already connected
   - Select the repository: `Guide-to-levelling-up-on-Github`
   - Click "Import"

3. **Configure Project**
   - **Root Directory**: Set to `code-warrior`
   - **Framework Preset**: Next.js (should be auto-detected)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

4. **Configure Environment Variables**
   
   Add the following environment variables in the Vercel project settings:

   | Variable Name | Value | Where to Find |
   |--------------|-------|---------------|
   | `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard → Settings → API |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key | Supabase Dashboard → Settings → API |
   | `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key | Supabase Dashboard → Settings → API (⚠️ Keep secret!) |
   | `NEXTAUTH_URL` | Your Vercel deployment URL | Will be `https://your-project.vercel.app` |
   | `NEXTAUTH_SECRET` | Random secret string | Generate with: `openssl rand -base64 32` |
   | `GITHUB_CLIENT_ID` | Your GitHub OAuth App Client ID | GitHub Settings → Developer settings → OAuth Apps |
   | `GITHUB_CLIENT_SECRET` | Your GitHub OAuth App Client Secret | GitHub Settings → Developer settings → OAuth Apps |

5. **Click "Deploy"**
   - Vercel will build and deploy your application
   - Wait for the deployment to complete

### 3. Update GitHub OAuth App Settings

After your first deployment, you need to update your GitHub OAuth App:

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Select your OAuth App
3. Update the following:
   - **Homepage URL**: `https://your-project.vercel.app`
   - **Authorization callback URL**: `https://your-project.vercel.app/api/auth/callback/github`
4. Save changes

### 4. Update NEXTAUTH_URL Environment Variable

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Update `NEXTAUTH_URL` to your actual Vercel deployment URL (e.g., `https://your-project.vercel.app`)
4. Redeploy the project for changes to take effect

### 5. Update Supabase URL Settings (if needed)

If you have any CORS or URL restrictions in Supabase:

1. Go to Supabase Dashboard → Settings → API
2. Add your Vercel deployment URL to the allowed origins

## Deploying via Vercel CLI

Alternatively, you can deploy using the CLI:

```bash
cd code-warrior
vercel
```

Follow the prompts to configure your project. Then set environment variables:

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add NEXTAUTH_URL
vercel env add NEXTAUTH_SECRET
vercel env add GITHUB_CLIENT_ID
vercel env add GITHUB_CLIENT_SECRET
```

Then deploy to production:

```bash
vercel --prod
```

## Generating NEXTAUTH_SECRET

Run one of these commands to generate a secure secret:

**PowerShell (Windows):**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

**Bash (Mac/Linux):**
```bash
openssl rand -base64 32
```

**Node.js (Any platform):**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Continuous Deployment

Once set up, Vercel will automatically:
- Deploy on every push to the `main` branch
- Create preview deployments for pull requests
- Run builds and show deployment status in GitHub

## Troubleshooting

### Build Fails

- Check the build logs in Vercel dashboard
- Ensure all environment variables are set correctly
- Verify the root directory is set to `code-warrior`

### Authentication Not Working

- Verify `NEXTAUTH_URL` matches your deployment URL exactly
- Check GitHub OAuth callback URL is correct
- Ensure `NEXTAUTH_SECRET` is set

### Database Errors

- Verify all Supabase environment variables are correct
- Check Supabase connection settings
- Ensure Supabase project is accessible from Vercel's IPs

### Performance Issues

- Check Vercel Analytics for insights
- Consider enabling Edge caching
- Review API route response times

## Custom Domain (Optional)

To use a custom domain:

1. Go to Vercel project settings → Domains
2. Add your domain
3. Configure DNS records as instructed
4. Update `NEXTAUTH_URL` and GitHub OAuth settings with new domain

## Next Steps

After successful deployment:

1. ✅ Test authentication flow
2. ✅ Verify database connections
3. ✅ Test all features (quests, badges, leaderboard)
4. ✅ Monitor error logs in Vercel dashboard
5. ✅ Set up Vercel Analytics (optional)

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [NextAuth.js Deployment](https://next-auth.js.org/deployment)
