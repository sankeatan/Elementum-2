if exist dist rmdir dist /s /q
npx tsc && node dist\server\src\app.js