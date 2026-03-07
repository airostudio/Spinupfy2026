# FTP Setup for Plesk (Without API Keys)

Since you have Plesk access but no "API Keys" option, we'll use FTP instead. This is simpler and works with all Plesk versions.

## Step 1: Create FTP Account in Plesk

1. **Log in to your Plesk control panel**

2. **Navigate to your domain:**
   - Click "Domains" in the left sidebar
   - Select `webese.ai` (or your domain)

3. **Create FTP account:**
   - Click "FTP Access" tab
   - Click "Add FTP Account" button
   - Fill in the form:
     ```
     FTP Account Name: webese_publisher
     Home Directory: /httpdocs
     Password: [Generate a strong password - SAVE THIS!]
     ```
   - Click "OK"

4. **Note down the FTP details:**
   ```
   FTP Host: Usually ftp.webese.ai or your server IP
   FTP Username: webese_publisher@webese.ai (or just webese_publisher)
   FTP Password: [The password you just created]
   FTP Port: 21 (standard FTP) or 22 (SFTP)
   ```

## Step 2: Add FTP Credentials to .env.local

Update your `.env.local` file with the FTP credentials:

```bash
# FTP Configuration (for file deployment)
FTP_HOST=ftp.webese.ai
FTP_USER=webese_publisher@webese.ai
FTP_PASSWORD=your-strong-password-here
FTP_PORT=21
FTP_SECURE=false
FTP_REMOTE_PATH=/httpdocs

# Keep these for reference (not used without API)
PLESK_PARENT_DOMAIN=webese.ai
```

### Finding Your FTP Host

Your FTP host is usually one of these:
- `ftp.yourdomain.com` (e.g., `ftp.webese.ai`)
- Your server's IP address (e.g., `123.45.67.89`)
- Your server hostname (e.g., `server.hosting.com`)

**To find it in Plesk:**
1. Look at the top of the Plesk dashboard - it shows your server name
2. OR check the FTP Access page - it usually shows the connection details
3. OR ask your hosting provider

## Step 3: Test FTP Connection

You can test the FTP connection using an FTP client like FileZilla:

1. **Download FileZilla** (free): https://filezilla-project.org/
2. **Connect with your credentials:**
   - Host: `ftp.webese.ai`
   - Username: `webese_publisher@webese.ai`
   - Password: [your password]
   - Port: 21
3. **Navigate to /httpdocs** - this is where files will be uploaded

If you can connect and see the `/httpdocs` directory, your FTP is working!

## Step 4: Configure Subdomain Path (Optional)

If you want files uploaded to a specific subdomain folder:

1. **Create subdomain in Plesk manually:**
   - Domains → Add Subdomain
   - Subdomain name: test.webese.ai
   - Document root: /test (or /httpdocs/test)

2. **Update FTP path in .env.local:**
   ```bash
   FTP_REMOTE_PATH=/httpdocs/test
   ```

## Step 5: Restart and Test

1. **Restart your dev server:**
   ```bash
   npm run dev
   ```

2. **Test publishing a website**
   - The system will now upload files via FTP
   - Check the server logs to see FTP activity

## How It Works Now

**Without Plesk API (using FTP only):**

```
✅ Save images → Works
✅ Generate subdomain name → Works
⚠️  Create subdomain in Plesk → MANUAL (you create it)
✅ Export to HTML/CSS → Works
✅ Deploy files via FTP → Works (if FTP configured)
✅ Update database → Works
```

**You need to manually:**
1. Create subdomain in Plesk: `random-name.webese.ai`
2. Point it to `/httpdocs/random-name` (or similar)
3. System uploads files to that location via FTP

## Alternative: Simple Setup

If you just want to test, use the main domain:

```bash
FTP_HOST=ftp.webese.ai
FTP_USER=your-main-ftp-user
FTP_PASSWORD=your-ftp-password
FTP_REMOTE_PATH=/httpdocs
```

Files will upload to: `https://webese.ai/`

## Troubleshooting

### "Connection refused" or "Connection timeout"
- Check FTP_HOST is correct
- Try using server IP instead of domain
- Check if port 21 is blocked by firewall
- Try FTP_PORT=22 for SFTP

### "Login incorrect"
- Check FTP_USER format (might need @domain.com suffix)
- Verify password is correct
- Check if FTP account is active in Plesk

### "Permission denied"
- Check FTP_REMOTE_PATH exists
- Verify FTP user has write permissions to that directory
- Try /httpdocs instead of subdirectory

### "FTP not configured - skipping"
- Make sure all FTP_ variables are set in .env.local
- Restart your dev server after adding them
- Check for typos in variable names

## Next Steps

Once FTP is working, you can optionally:
1. Automate subdomain creation (ask hosting provider for API access)
2. Set up multiple FTP accounts for different subdomains
3. Use SFTP (more secure) by setting FTP_PORT=22 and FTP_SECURE=true

---

**Need help?** Share the error message and I'll troubleshoot it!
