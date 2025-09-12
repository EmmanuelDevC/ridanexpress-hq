import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LocalMallIcon from '@mui/icons-material/LocalMall';
import HomeFilledIcon from '@mui/icons-material/HomeFilled';
import PaymentIcon from '@mui/icons-material/Payment';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import AddIcon from '@mui/icons-material/Add';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import WidgetsIcon from '@mui/icons-material/Widgets';

const BottomNav = ({ showSidebar, setShowSidebar }) => {
    const { userInfo } = useSelector(state => state.auth);
    const location = useLocation();
    const [activeTab, setActiveTab] = useState(location.pathname);

    const navItems = [
        { path: '/seller/dashboard', icon: <HomeFilledIcon />, label: 'Home' },
        { path: '/seller/dashboard/orders', icon: <LocalMallIcon />, label: 'Orders' },
        { path: '/seller/dashboard/add-product', icon: <AddIcon />, label: 'Add', isSpecial: true },
        { path: '/seller/dashboard/payments', icon: <PaymentIcon />, label: 'Payment' },
        { 
            icon: <MoreHorizIcon />, 
            label: 'More', 
            isAction: true,
            onClick: () => setShowSidebar(!showSidebar) 
        },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
            {/* Background with blur effect */}
            <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-700/50"></div>

            {/* Navigation container */}
            <nav className="relative flex justify-around items-center h-20 px-2">
                {navItems.map((item) => (
                    <NavItem
                        key={item.path || item.label}
                        to={item.path}
                        icon={item.icon}
                        label={item.label}
                        isActive={activeTab === item.path}
                        isSpecial={item.isSpecial}
                        isAction={item.isAction}
                        onClick={item.onClick || (() => setActiveTab(item.path))}
                    />
                ))}
            </nav>
        </div>
    );
};

// Navigation item component
const NavItem = ({ to, icon, label, isActive, isSpecial, isAction, onClick }) => {
    if (isSpecial) {
        return (
            <div className="relative flex-1 flex justify-center">
                <Link
                    to={to}
                    className="absolute bottom-3 flex items-center justify-center w-14 h-14 border border-indigo-500 shadow shadow-lg shadow-indigo-500 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:from-blue-500 hover:to-purple-500 transition-all duration-300 transform hover:scale-105 z-10"
                    onClick={onClick}
                >
                    {icon}
                </Link>
            </div>
        );
    }

    if (isAction) {
        return (
            <button
                className={`flex flex-col items-center justify-center mb-3 flex-1 p-2 transition-all duration-300 ${
                    isActive 
                        ? 'text-blue-400' 
                        : 'text-gray-400 hover:text-white'
                }`}
                onClick={onClick}
            >
                <div className={`text-2xl transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}>
                    {icon}
                </div>
                <span className="text-xs font-medium mt-1">{label}</span>
                
                {/* Active indicator */}
                {isActive && (
                    <div className="w-1 h-1 bg-blue-400 rounded-full mt-1"></div>
                )}
            </button>
        );
    }

    return (
        <Link
            to={to}
            className={`flex flex-col items-center justify-center mb-3 flex-1 p-2 transition-all duration-300 ${
                isActive 
                    ? 'text-blue-400' 
                    : 'text-gray-400 hover:text-white'
            }`}
            onClick={onClick}
        >
            <div className={`text-2xl transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}>
                {icon}
            </div>
            <span className="text-xs font-medium mt-1">{label}</span>
            
            {/* Active indicator */}
            {isActive && (
                <div className="w-1 h-1 bg-blue-400 rounded-full mt-1"></div>
            )}
        </Link>
    );
};

export default BottomNav;