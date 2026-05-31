# SEMO

SEMO is a smart e-scooter fleet management platform with authentication, scooter tracking, maintenance management, and analytics.

## Project Structure

- `backend/`: Spring Boot REST API with JWT authentication, MySQL, and seeded sample data.
- `frontend/`: React + Vite client for user and admin flows.
- `uploads/`: storage for avatar and scooter images.

## Requirements

- Java 21
- Node.js 18+
- npm
- MySQL

## Backend Setup

Open a terminal in `backend/` and run:

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

If you want to skip tests during packaging:

```bash
cd backend
mvn clean package -DskipTests
mvn spring-boot:run
```

Before starting the backend, make sure the following environment variables are configured if your setup requires them:

- `DB_PASSWORD`
- `JWT_SECRET`
- `JWT_EXPIRATION`
- `PORT`

The backend is expected to run on `http://localhost:8888` by default.

## Frontend Setup

Open a terminal in `frontend/` and install the dependencies:

```bash
cd frontend
npm install
```

Then start the development server:

```bash
cd frontend
npm run dev
```

To create a production build:

```bash
cd frontend
npm run build
```

The frontend is configured to talk to `http://localhost:8888` by default.

## Default Admin Account

- Email: `admin@semo.com`
- Password: `Admin@123`

## Main Features

- JWT login and role-based routing
- Admin management for users, scooters, rentals, maintenance, and analytics
- Customer profile, wallet deposit, and password change
- Map-based scooter creation in the admin area
- Map visualization for scooter locations and analytics results
- Upload support for avatars and scooter images

## API Reference

See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for the endpoint list.

## Quick Start

1. Start MySQL.
2. Start the backend.
3. Run `npm install` inside `frontend/`.
4. Start the frontend with `npm run dev`.
5. Log in with the default admin account if you want to access the admin area.
