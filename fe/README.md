
# Wise Key - Hệ Thống Quản Lý Trung Tâm Ngoại Ngữ

A modern language center management system built with React, Vite, and Tailwind CSS.

## Features

### For Admin
- Dashboard with statistics and quick actions
- Course management (CRUD)
- Class management with teacher assignment
- User management (students, teachers, admins)
- Reports and analytics

### For Teacher
- View assigned classes
- Take attendance
- Enter and manage grades
- View class schedules

### For Student
- Browse and search courses
- Enroll in classes
- View personal schedule
- Check grades and academic progress

## Tech Stack

- **React 18** - UI library
- **Vite 5** - Build tool
- **Tailwind CSS 3** - Styling
- **React Router 6** - Navigation
- **Axios** - HTTP client
- **React Icons** - Icon library
- **React Toastify** - Notifications

## Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_NAME=Wise Key - Hệ Thống Quản Lý Trung Tâm Ngoại Ngữ
VITE_APP_VERSION=1.0.0
```

## Project Structure

```
fe/
├── public/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   ├── common/
│   │   └── layout/
│   ├── context/
│   ├── hooks/
│   ├── pages/
│   │   ├── admin/
│   │   ├── teacher/
│   │   └── student/
│   ├── services/
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## Demo Accounts

- **Admin**: admin / admin123
- **Teacher**: teacher / teacher123
- **Student**: student / student123

## License

MIT
