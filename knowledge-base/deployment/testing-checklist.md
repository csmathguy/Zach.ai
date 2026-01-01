# Deployment Testing Checklist

Complete this checklist to verify your local deployment setup is working correctly.

## ✅ Development Environment

- [ ] **Start dev**: Run `npm run dev`
  - Frontend accessible at http://localhost:5173
  - Backend accessible at http://localhost:3000
  - All three cards display data correctly
  - Shows "Development" badges

- [ ] **Hot reload test**: Make a change in `backend/src/server.ts`
  - Edit the `/api/status` message
  - Save file → backend restarts automatically
  - Refresh browser → see new message (no manual rebuild needed)

- [ ] **CORS working**: Check browser console
  - No CORS errors when fetching from localhost:3000
  - API calls succeed

## ✅ Production Deployment

- [ ] **Production running**: Check http://localhost:8080
  - Site loads correctly
  - Shows "Production" badge
  - Displays old message (before your test change)

- [ ] **Deploy workflow**:

  ```powershell
  # Make a change in code
  # Commit to git
  git add .
  git commit -m "Test: Update status message"

  # Deploy to production
  npm run deploy
  ```

  - Build completes successfully
  - Snapshot created in `deploy/current/`
  - PM2 reload succeeds
  - Production now shows NEW message

- [ ] **PM2 status**: Run `npx pm2 ls`
  - Process `main` is online
  - Memory usage reasonable
  - No restarts (stable)

## ✅ Git Workflow

- [ ] **Branch management**:
  ```powershell
  # Work on feature branch
  git checkout -b feature/test-change
  # Make changes, test in dev
  npm run dev
  # Commit and push
  git add .
  git commit -m "Add: New feature"
  git push origin feature/test-change
  # Merge to main via PR
  # Pull latest main
  git checkout main
  git pull origin main
  # Deploy to production
  npm run deploy
  ```

## ✅ Auto-Start on Reboot

- [ ] **Task Scheduler configured**: Run `Get-ScheduledTask -TaskName PM2-Resurrect-Main`
  - Task exists and is Ready
- [ ] **Test reboot** (optional):
  - Restart Windows
  - Log back in
  - Wait 10 seconds
  - Check http://localhost:8080 (should be running automatically)
  - Verify with `npx pm2 ls`

## ✅ Process Management

- [ ] **Stop main**: `npx pm2 stop main`
  - http://localhost:8080 should be unreachable
- [ ] **Restart main**: `npm run start:main`
  - Site comes back online
  - Serves from latest snapshot

- [ ] **View logs**: `npx pm2 logs main --lines 50`
  - No errors
  - Shows server startup messages

- [ ] **Monitor resources**: `npx pm2 monit`
  - CPU and memory usage reasonable
  - Press Ctrl+C to exit

## ✅ Snapshot Isolation

- [ ] **Verify isolation**:
  - Edit `frontend/src/main.ts` or `backend/src/server.ts`
  - DO NOT run `npm run deploy`
  - Check http://localhost:8080 → should NOT show changes
  - Check http://localhost:5173 → SHOULD show changes
  - This confirms production serves from snapshot, not live code

## 🎯 Recommended Workflow

### Daily Development

1. `npm run dev` - Start development servers
2. Code, test, iterate (hot reload active)
3. Commit changes to feature branch
4. Push and create PR

### Deploying to Production

1. Merge PR to main
2. `git checkout main && git pull origin main`
3. `npm run deploy`
4. Verify at http://localhost:8080

### Managing Production

- **View status**: `npx pm2 ls`
- **View logs**: `npx pm2 logs main`
- **Restart**: `npx pm2 restart main`
- **Stop**: `npx pm2 stop main`
- **Start**: `npm run start:main`

## 📝 Notes

- Dev uses ports 5173 (frontend) and 3000 (backend)
- Production uses port 8080 (combined)
- PM2 process list saved to `~/.pm2/dump.pm2`
- Snapshot location: `deploy/current/`
- Task Scheduler task: `PM2-Resurrect-Main`

## 🚨 Troubleshooting

**Dev not loading:**

- Check if ports 5173 or 3000 are in use
- Run `npm run setup` to ensure dependencies installed

**Production not loading:**

- Run `npx pm2 describe main` to check status
- Check logs: `npx pm2 logs main --lines 100`
- Verify snapshot exists: `ls deploy/current/`

**Changes not appearing in production:**

- Did you run `npm run deploy`?
- Check PM2 reloaded: `npx pm2 logs main | Select-String -Pattern "listening"`

**Auto-start not working after reboot:**

- Verify task: `Get-ScheduledTask -TaskName PM2-Resurrect-Main`
- Check task history: `Get-ScheduledTask -TaskName PM2-Resurrect-Main | Get-ScheduledTaskInfo`
- Manually run: `npx pm2 resurrect`
