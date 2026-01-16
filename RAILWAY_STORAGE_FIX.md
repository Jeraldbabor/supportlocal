# Railway Storage Fix Guide

## Problem
Railway uses **ephemeral filesystems** - files stored in `storage/app/public` are **lost on every redeploy**.

## Solution Options

### Option 1: Use Railway Volumes (Recommended for small to medium apps)
Railway Volumes provide persistent storage that survives redeploys.

1. In Railway dashboard, add a **Volume** to your service
2. Mount it to `/app/storage/app/public`
3. Your images will persist across redeploys

### Option 2: Use S3/Cloud Storage (Recommended for production)
Use AWS S3, Cloudinary, or similar services for image storage.

1. Configure S3 credentials in Railway environment variables:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_DEFAULT_REGION`
   - `AWS_BUCKET`

2. Change `FILESYSTEM_DISK` in `.env`:
   ```
   FILESYSTEM_DISK=s3
   ```

3. Images will be stored in S3 and persist permanently

### Option 3: Current Workaround (What we're using now)
Using `/images/` route that serves files directly from `storage/app/public`.

**Pros:**
- Works immediately without additional setup
- No code changes needed for image URLs

**Cons:**
- Images are still lost on redeploy
- Requires manual re-upload after redeploy

## Image URL Fixes Applied

1. Created `ImageHelper::url()` helper function that generates `/images/` URLs
2. Updated all controllers to use `ImageHelper::url()` instead of `asset('storage/')`
3. Fixed frontend components to use `/images/` instead of `/storage/`

## Migration to S3 (Recommended)

To migrate to S3 storage:

1. Install AWS SDK (if not already):
   ```bash
   composer require league/flysystem-aws-s3-v3 "^3.0"
   ```

2. Set environment variables in Railway:
   ```
   FILESYSTEM_DISK=s3
   AWS_ACCESS_KEY_ID=your_key
   AWS_SECRET_ACCESS_KEY=your_secret
   AWS_DEFAULT_REGION=us-east-1
   AWS_BUCKET=your-bucket-name
   ```

3. The `ImageHelper` class will automatically handle S3 URLs

## Performance Optimizations Applied

1. Added eager loading in controllers to prevent N+1 queries
2. Fixed missing relationships in order queries
3. Optimized product listing queries

## Next Steps

1. **Immediate**: Current `/images/` route works but images are lost on redeploy
2. **Short-term**: Set up Railway Volume for persistent storage
3. **Long-term**: Migrate to S3 for production-grade storage
