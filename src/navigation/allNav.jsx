import { BiCategory, BiLoaderCircle } from 'react-icons/bi'
import DashboardIcon from '@mui/icons-material/Dashboard';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import PaymentIcon from '@mui/icons-material/Payment';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import AddBoxIcon from '@mui/icons-material/AddBox';
import CategoryIcon from '@mui/icons-material/Category';
import WidgetsIcon from '@mui/icons-material/Widgets';
import { FiUsers } from 'react-icons/fi'
import { CiChat1 } from 'react-icons/ci'
import { BsCurrencyDollar, BsChat } from 'react-icons/bs'
// import { RiProductHuntLine } from 'react-icons/ri'
export const allNav = [
    {
        id: 1,
        title: 'Dashboard',
        icon: <DashboardIcon />,
        role: 'admin',
        path: '/admin/dashboard'
    },
    {
        id: 2,
        title: 'Orders',
        icon: <LocalShippingIcon />,
        role: 'admin',
        path: '/admin/dashboard/orders'
    },
    {
        id: 3,
        title: 'Category',
        icon: < CategoryIcon/>,
        role: 'admin',
        path: '/admin/dashboard/category'
    },
    {
        id: 4,
        title: 'Sellers',
        icon: <FiUsers />,
        role: 'admin',
        path: '/admin/dashboard/sellers'
    },
    {
        id: 5,
        title: 'Payment request',
        icon: <BsCurrencyDollar />,
        role: 'admin',
        path: '/admin/dashboard/payment-request'
    },
    {
        id: 6,
        title: 'Deactive Sellers',
        icon: <FiUsers />,
        role: 'admin',
        path: '/admin/dashboard/deactive-sellers'
    },
    {
        id: 7,
        title: 'Sellers Request',
        icon: <BiLoaderCircle />,
        role: 'admin',
        path: '/admin/dashboard/sellers-request'
    },
    {
        id: 8,
        title: 'Chat Seller',
        icon: <CiChat1 />,
        role: 'admin',
        path: '/admin/dashboard/chat-sellers'
    },

//   --------------------------------------------------------------------------------------------------
// SELLERS

    {
        id: 9,
        title: 'Dashboard',
        icon: <DashboardIcon />,
        role: 'seller',
        path: '/seller/dashboard'
    },
    {
        id: 10,
        title: 'Add Product',
        icon: <AddBoxIcon />,
        role: 'seller',
        path: '/seller/dashboard/add-product'
    },
    {
        id: 11,
        title: 'All Product',
        icon: <WidgetsIcon />,
        role: 'seller',
        path: '/seller/dashboard/products'
    },
    // {
    //     id: 11,
    //     title: 'All Banner',
    //     icon: <RiProductHuntLine />,
    //     role: 'seller',
    //     path: '/seller/dashboard/banners'
    // },

    // {
    //     id: 12,
    //     title: 'Discount Product',
    //     icon: <RiProductHuntLine />,
    //     role: 'seller',
    //     path: '/seller/dashboard/discount-products'
    // },
    {
        id: 13,
        title: 'Orders',
        icon: < LocalShippingIcon />,
        role: 'seller',
        path: '/seller/dashboard/orders'
    },
    {
        id: 13,
        title: 'Premium Subscription',
        icon: <WorkspacePremiumIcon />,
        role: 'seller',
        path: '/seller/dashboard/premium-subscription'
    },
    {
        id: 14,
        title: 'Payments',
        icon: <PaymentIcon />,
        role: 'seller',
        path: '/seller/dashboard/payments'
    },
    {
        id: 15,
        title: 'Chat Customer',
        icon: <QuestionAnswerIcon />,
        role: 'seller',
        path: '/seller/dashboard/chat-customer'
    },
    {
        id: 16,
        title: 'Chat Support',
        icon: <ContactSupportIcon />,
        role: 'seller',
        path: '/seller/dashboard/chat-support'
    },
    {
        id: 17,
        title: 'Profile',
        icon: <AccountBoxIcon />,
        role: 'seller',
        path: '/seller/dashboard/profile'
    },
]