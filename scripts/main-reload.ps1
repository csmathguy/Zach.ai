# Reloads main process to pick up new code
param()

if (Get-Command pm2 -ErrorAction SilentlyContinue) {
	pm2 reload main
} else {
	npx pm2 reload main
}
