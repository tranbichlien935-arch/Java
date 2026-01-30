import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import { FaGraduationCap, FaHome, FaUser, FaSignOutAlt, FaChartBar, FaBook, FaUsers, FaClipboardList, FaCalendar, FaTrophy } from 'react-icons/fa';

const Navbar = () => {
    const { user, logout, isAdmin, isTeacher, isStudent } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow-md border-b-2 border-primary">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo and Brand */}
                    <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <img src="/logo.png" alt="Wise Key Logo" className="h-10 w-10 object-contain" />
                        <div className="flex flex-col">
                            <span className="text-xl font-bold text-primary-dark">Wise Key</span>
                            <span className="text-xs text-gray-600 hidden sm:block">Trung Tâm Ngoại Ngữ</span>
                        </div>
                    </Link>

                    {/* Navigation Links */}
                    {user && (
                        <div className="flex items-center gap-6">
                            {/* Admin Links */}
                            {isAdmin() && (
                                <>
                                    <Link to="/admin/dashboard" className="flex items-center gap-2 text-gray-700 hover:text-primary transition-colors">
                                        <FaChartBar />
                                        <span className="hidden md:block">Dashboard</span>
                                    </Link>
                                    <Link to="/admin/courses" className="flex items-center gap-2 text-gray-700 hover:text-primary transition-colors">
                                        <FaBook />
                                        <span className="hidden md:block">Khóa học</span>
                                    </Link>
                                    <Link to="/admin/classes" className="flex items-center gap-2 text-gray-700 hover:text-primary transition-colors">
                                        <FaClipboardList />
                                        <span className="hidden md:block">Lớp học</span>
                                    </Link>
                                    <Link to="/admin/users" className="flex items-center gap-2 text-gray-700 hover:text-primary transition-colors">
                                        <FaUsers />
                                        <span className="hidden md:block">Người dùng</span>
                                    </Link>
                                    <Link to="/admin/enrollments" className="flex items-center gap-2 text-gray-700 hover:text-primary transition-colors">
                                        <FaClipboardList />
                                        <span className="hidden md:block">Đăng ký</span>
                                    </Link>
                                </>
                            )}

                            {/* Teacher Links */}
                            {isTeacher() && (
                                <>
                                    <Link to="/teacher/dashboard" className="flex items-center gap-2 text-gray-700 hover:text-primary transition-colors">
                                        <FaHome />
                                        <span className="hidden md:block">Dashboard</span>
                                    </Link>
                                    <Link to="/teacher/classes" className="flex items-center gap-2 text-gray-700 hover:text-primary transition-colors">
                                        <FaBook />
                                        <span className="hidden md:block">Lớp học</span>
                                    </Link>
                                    <Link to="/teacher/attendance" className="flex items-center gap-2 text-gray-700 hover:text-primary transition-colors">
                                        <FaClipboardList />
                                        <span className="hidden md:block">Điểm danh</span>
                                    </Link>
                                    <Link to="/teacher/grading" className="flex items-center gap-2 text-gray-700 hover:text-primary transition-colors">
                                        <FaTrophy />
                                        <span className="hidden md:block">Nhập điểm</span>
                                    </Link>
                                </>
                            )}

                            {/* Student Links */}
                            {isStudent() && (
                                <>
                                    <Link to="/student/courses" className="flex items-center gap-2 text-gray-700 hover:text-primary transition-colors">
                                        <FaBook />
                                        <span className="hidden md:block">Khóa học</span>
                                    </Link>
                                    <Link to="/student/schedule" className="flex items-center gap-2 text-gray-700 hover:text-primary transition-colors">
                                        <FaCalendar />
                                        <span className="hidden md:block">Lịch học</span>
                                    </Link>
                                    <Link to="/student/grades" className="flex items-center gap-2 text-gray-700 hover:text-primary transition-colors">
                                        <FaTrophy />
                                        <span className="hidden md:block">Kết quả</span>
                                    </Link>
                                </>
                            )}

                            {/* User Menu */}
                            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-300">
                                <Link to="/profile" className="flex items-center gap-2 text-gray-700 hover:text-primary transition-colors">
                                    <FaUser />
                                    <span className="hidden lg:block font-medium">{user.username}</span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 text-gray-700 hover:text-danger transition-colors"
                                    title="Đăng xuất"
                                >
                                    <FaSignOutAlt />
                                    <span className="hidden lg:block">Đăng xuất</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
