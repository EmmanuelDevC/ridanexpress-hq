import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { getNavs } from '../navigation/index'
import { logout } from '../store/Reducers/authReducer'
import LogoutIcon from '@mui/icons-material/Logout'
import { RxPerson } from 'react-icons/rx'
import { useDispatch } from 'react-redux'
// import logo from '../assets/logo.png'

const Sidebar = ({ showSidebar, setShowSidebar }) => {

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { role } = useSelector(state => state.auth)
  const { pathname } = useLocation()
  const [allNav, setAllNav] = useState([])
  useEffect(() => {
    const navs = getNavs(role)
    setAllNav(navs)
  }, [role])

  return (
    <div>
      <div onClick={() => setShowSidebar(false)} className={`fixed duration-200 ${!showSidebar ? 'invisible' : 'visible'} w-screen h-screen bg-[#22292f80] top-0 left-0 z-10`}></div>
      <div className={`lg:w-[260px] w-[260px]  fixed bg-gray-900 rounded-r-[1rem] border-r border-indigo-500 z-50 top-0 h-screen shadow-[0_0_15px_0_rgb(34_41_47_/_5%)] transition-all ${showSidebar ? 'left-0' : '-left-[290px] lg:left-0'}`}>
        <div className="m-8 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center">
            <RxPerson className="text-2xl text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Dashboard</h2>
            <p className="text-sm text-gray-400">
              {role === 'admin' ? 'Admin' : role === 'seller' ? 'Vendor' : 'User'} Dashboard
            </p>
          </div>
        </div>
        <div className='px-[16px]'>
          <ul>
            {allNav.map((n, i) => (
              <li key={i}>
                <Link
                  to={n.path}
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      setShowSidebar(false);
                    }
                  }}
                  className={`${pathname === n.path
                      ? 'bg-indigo-600/20 text-indigo-400 shadow-indigo-500/30 duration-500'
                      : 'text-[#d0d2d6] font-normal duration-200'
                    } px-[12px] py-[9px] rounded-xl flex justify-start items-center gap-[12px] hover:text-gray-300 hover:bg-gray-800 hover:pl-4 transition-all w-full mb-1`}
                >
                  <span>{n.icon}</span>
                  <span>{n.title}</span>
                </Link>
              </li>
            ))}
            <li>
              <button
                onClick={() => dispatch(logout({ navigate, role }))}
                className="text-[#d0d2d6] font-normal duration-200 px-[12px] py-[9px] rounded-sm flex justify-start items-center gap-[12px] hover:pl-4 transition-all w-full mb-1"
              >
                <span><LogoutIcon /></span>
                <span>Logout</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Sidebar