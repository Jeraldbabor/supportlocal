# Why Images Disappear on Every Railway Redeploy

## The Root Cause

**Railway uses ephemeral (temporary) filesystems** for containers. This means:

1. **On Deploy**: Railway creates a fresh container
2. **Filesystem**: The container gets a new, empty filesystem
3. **Your Code**: Gets deployed from Git ✅
4. **Your Database**: Persists (external service) ✅
5. **Your Files**: **DELETED** ❌ (filesystem is recreated)

This is **normal behavior** for containerized platforms like Railway, Heroku, etc.

## Visual Explanation

```
Before Redeploy:
├── storage/app/public/
│   ├── products/image1.jpg ✅
│   ├── products/image2.jpg ✅
│   └── avatars/user1.jpg ✅

After Redeploy:
├── storage/app/public/
│   └── (empty) ❌ All files gone!
```

## The Solution

You have **2 options** to fix this permanently:

### 🚀 Option 1: Railway Volume (Easiest - 5 minutes)

**What it does**: Creates a persistent disk that survives redeploys

**Steps**:
1. Railway Dashboard → Your Service → **Volumes** tab
2. Click **"Add Volume"**
3. Name: `storage-data`
4. Mount Path: `/app/storage/app/public`
5. Size: `10` GB (or more)
6. Click **"Add"**

**Result**: Images will persist forever! ✅

---

### ☁️ Option 2: AWS S3 (Best for Production)

**What it does**: Stores images in cloud storage (unlimited, fast, reliable)

**Steps**:
1. Create AWS S3 bucket
2. Get AWS credentials
3. Add to Railway environment variables:
   ```
   FILESYSTEM_DISK=s3
   AWS_ACCESS_KEY_ID=your_key
   AWS_SECRET_ACCESS_KEY=your_secret
   AWS_DEFAULT_REGION=us-east-1
   AWS_BUCKET=your-bucket-name
   ```
4. Install: `composer require league/flysystem-aws-s3-v3 "^3.0"`
5. Redeploy

**Result**: Images stored in S3, never lost! ✅

---

## What We've Already Fixed

✅ **Image URLs**: All use `/images/` route (works without symlinks)
✅ **Code**: `ImageHelper` automatically supports S3 when configured
✅ **Controllers**: All use `ImageHelper::url()` for consistency

## What You Need to Do

**Choose one**:
- **Quick Fix**: Set up Railway Volume (5 minutes)
- **Production**: Set up S3 (15 minutes, better long-term)

See `QUICK_FIX_RAILWAY.md` for step-by-step instructions.

## Why This Happens

This is **not a bug** - it's how modern containerized deployments work:

- ✅ **Stateless containers** = faster, more reliable deployments
- ✅ **External storage** = data persistence
- ✅ **Database** = Already external (persists) ✅
- ❌ **File storage** = Needs to be external too (Volume or S3)

## After You Fix It

Once you set up Volume or S3:
- ✅ Images persist across redeploys
- ✅ No more lost images
- ✅ System works perfectly

**The code is ready** - you just need to configure persistent storage!
