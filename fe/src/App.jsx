import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminCourses from './pages/admin/Courses';
import AdminClasses from './pages/admin/Classes';
import AdminUsers from './pages/admin/Users';
import EnrollmentManagement from './pages/admin/EnrollmentManagement';

// Teacher Pages
import TeacherDashboard from './pages/teacher/Dashboard';
import TeacherClasses from './pages/teacher/Classes';
import Attendance from './pages/teacher/Attendance';
import Grading from './pages/teacher/Grading';

// Student Pages
import StudentCourses from './pages/student/Courses';
import CourseDetail from './pages/student/CourseDetail';
import Schedule from './pages/student/Schedule';
import Grades from './pages/student/Grades';

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="min-h-screen flex flex-col">
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        {/* Protected Routes - All Authenticated Users */}
                        <Route
                            path="/profile"
                            element={
                                <ProtectedRoute>
                                    <Profile />
                                </ProtectedRoute>
                            }
                        />

                        {/* Admin Routes */}
                        <Route
                            path="/admin/dashboard"
                            element={
                                <ProtectedRoute requiredRole="ROLE_ADMIN">
                                    <AdminDashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/courses"
                            element={
                                <ProtectedRoute requiredRole="ROLE_ADMIN">
                                    <AdminCourses />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/classes"
                            element={
                                <ProtectedRoute requiredRole="ROLE_ADMIN">
                                    <AdminClasses />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/users"
                            element={
                                <ProtectedRoute requiredRole="ROLE_ADMIN">
                                    <AdminUsers />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/enrollments"
                            element={
                                <ProtectedRoute requiredRole="ROLE_ADMIN">
                                    <EnrollmentManagement />
                                </ProtectedRoute>
                            }
                        />

                        {/* Teacher Routes */}
                        <Route
                            path="/teacher/dashboard"
                            element={
                                <ProtectedRoute requiredRole={['ROLE_ADMIN', 'ROLE_TEACHER']}>
                                    <TeacherDashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/teacher/classes"
                            element={
                                <ProtectedRoute requiredRole={['ROLE_ADMIN', 'ROLE_TEACHER']}>
                                    <TeacherClasses />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/teacher/attendance"
                            element={
                                <ProtectedRoute requiredRole={['ROLE_ADMIN', 'ROLE_TEACHER']}>
                                    <Attendance />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/teacher/grading"
                            element={
                                <ProtectedRoute requiredRole={['ROLE_ADMIN', 'ROLE_TEACHER']}>
                                    <Grading />
                                </ProtectedRoute>
                            }
                        />

                        {/* Student Routes */}
                        <Route
                            path="/student/courses"
                            element={
                                <ProtectedRoute>
                                    <StudentCourses />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/student/courses/:id"
                            element={
                                <ProtectedRoute>
                                    <CourseDetail />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/student/schedule"
                            element={
                                <ProtectedRoute>
                                    <Schedule />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/student/grades"
                            element={
                                <ProtectedRoute>
                                    <Grades />
                                </ProtectedRoute>
                            }
                        />

                        {/* Default Route - Redirect to Login */}
                        <Route path="/" element={<Navigate to="/login" replace />} />

                        {/* 404 Not Found */}
                        <Route path="*" element={<NotFound />} />
                    </Routes>

                    <ToastContainer
                        position="top-right"
                        autoClose={3000}
                        hideProgressBar={false}
                        newestOnTop
                        closeOnClick
                        rtl={false}
                        pauseOnFocusLoss
                        draggable
                        pauseOnHover
                        theme="light"
                    />
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
