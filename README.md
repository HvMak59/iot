# Hermes Ticket Management - NestJS Backend

## Structure
```
src/
├── auth/           # Authentication module
├── user/           # User module  
├── user-role/      # User roles module
├── device/         # Device module
├── customer/       # Customer module
├── ticket/         # Ticket module (with cron job)
├── quotation/      # Quotation module
├── common/         # Shared guards, decorators
└── app.module.ts   # Main module
```

## Installation
```bash
npm install @nestjs/common @nestjs/core @nestjs/config @nestjs/typeorm @nestjs/passport @nestjs/jwt @nestjs/schedule
npm install typeorm pg passport passport-jwt bcrypt class-validator class-transformer
npm install -D @types/passport-jwt @types/bcrypt
```

## Environment (.env)
```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=hermes
JWT_SECRET=your-secret-key
NODE_ENV=development
```

## Cron Job
Auto-close runs daily at midnight via `@nestjs/schedule`. See `ticket.service.ts`.

## Run
```bash
npm run start:dev
```
