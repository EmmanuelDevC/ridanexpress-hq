"use client"

import React, { useEffect } from "react"
import { BsCurrencyDollar, BsBoxSeam, BsServer } from "react-icons/bs"
import { FiUsers, FiShoppingBag, FiActivity } from "react-icons/fi"
import { MdOutlineSecurity, MdOutlineDataThresholding } from "react-icons/md"
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings"
import SecurityIcon from "@mui/icons-material/Security"
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive"
import DashboardIcon from "@mui/icons-material/Dashboard"
import SettingsIcon from "@mui/icons-material/Settings"
import ReportIcon from "@mui/icons-material/Assessment"
import LocalPostOfficeTwoToneIcon from "@mui/icons-material/LocalPostOfficeTwoTone"
import OnlinePredictionIcon from "@mui/icons-material/OnlinePrediction"
import { Link } from "react-router-dom"
import Chart from "react-apexcharts"
import moment from "moment"
import { useSelector, useDispatch } from "react-redux"
import seller from "../../assets/seller.png"
import { get_admin_dashboard_index_data } from "../../store/Reducers/dashboardIndexReducer"

const AdminDashboard = () => {
  const formatNumber = (num) => {
    if (typeof num === "string" && num.startsWith("₦")) {
      num = Number.parseFloat(num.substring(1).replace(/,/g, ""))
    }
    if (!num) return "0"
    if (num >= 1000000) return `${Math.round(num / 1000000)}M`
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  const { userInfo } = useSelector((state) => state.auth)
  const { totalSale, totalOrder, totalProduct, totalSeller, recentOrders, recentMessage } = useSelector(
    (state) => state.dashboardIndex,
  )
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(get_admin_dashboard_index_data())
  }, [dispatch])

  const chartOptions = {
    colors: ["#6366f1", "#ec4899", "#10B981"],
    chart: {
      type: "bar",
      height: 350,
      foreColor: "#d0d2d6",
      background: "transparent",
      toolbar: { show: false },
      fontFamily: "Inter, sans-serif",
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        borderRadius: 8,
        distributed: false,
      },
    },
    dataLabels: { enabled: false },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: {
          colors: "#d0d2d6",
          fontSize: "12px",
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: "#d0d2d6",
          fontSize: "12px",
        },
        formatter: (val) => `₦${formatNumber(val)}`,
      },
    },
    fill: {
      opacity: 1,
      type: "gradient",
      gradient: {
        shade: "dark",
        type: "vertical",
        shadeIntensity: 0.5,
        gradientToColors: ["#6366f1", "#ec4899", "#10B981"],
        inverseColors: false,
        opacityFrom: 0.8,
        opacityTo: 0.2,
        stops: [0, 100],
      },
    },
    grid: {
      borderColor: "#374151",
      strokeDashArray: 5,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      labels: { colors: "#d0d2d6" },
      fontSize: "14px",
      itemMargin: {
        horizontal: 10,
        vertical: 5,
      },
    },
    tooltip: {
      theme: "dark",
      y: { formatter: (val) => `₦${formatNumber(val)}` },
      style: {
        fontSize: "12px",
        fontFamily: "Inter, sans-serif",
      },
    },
    responsive: [
      {
        breakpoint: 640,
        options: {
          chart: { height: 300 },
          legend: {
            position: "bottom",
            horizontalAlign: "center",
          },
        },
      },
    ],
  }
  const chartSeries = [
    {
      name: "Orders",
      data: [34, 65, 34, 65, 34, 34, 34, 56, 23, 67, 23, 45],
    },
    {
      name: "Revenue",
      data: [34, 32, 45, 32, 34, 34, 43, 56, 65, 67, 45, 78],
    },
    {
      name: "Sellers",
      data: [78, 32, 34, 54, 65, 34, 54, 21, 54, 43, 45, 43],
    },
  ]
  const MetricCard = ({ icon, title, value, trend, colorClass }) => (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-4 rounded-xl border border-slate-700 hover:border-indigo-400 transition-all duration-300 shadow-lg hover:shadow-indigo-500/20">
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-xl ${colorClass} shadow-md`}>
          {React.cloneElement(icon, { className: "w-6 h-6 text-white" })}
        </div>
        <div>
          <p className="text-xs lg:text-sm text-slate-400 mb-1">{title}</p>
          <p className="text-xl lg:text-2xl font-bold text-white">{formatNumber(value)}</p>
          <span
            className={`text-xs ${trend.includes("+") ? "text-emerald-400" : "text-rose-400"} flex items-center gap-1 mt-1`}
          >
            <span
              className={`inline-block w-0 h-0 border-x-4 border-x-transparent ${trend.includes("+") ? "border-b-[6px] border-b-emerald-400" : "border-t-[6px] border-t-rose-400"}`}
            ></span>
            {trend} from last month
          </span>
        </div>
      </div>
    </div>
  )
  return (
    <div className="px-2 md:px-4 lg:px-6 py-4 bg-gradient-to-br from-slate-900 to-gray-900 min-h-screen text-slate-100">
      {/* Enhanced Admin Header Section */}
      <div className="mb-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-4 md:p-6 border border-slate-700 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          {/* Admin Profile Section */}
          <div className="flex-1 w-full">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="w-14 h-14 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
                  <span className="text-xl font-bold text-indigo-100">{userInfo.name[0]}</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900"></div>
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-white flex items-center gap-3">
                  {userInfo.name}
                  <span className="text-xs font-medium bg-gradient-to-r from-indigo-600/30 to-purple-600/30 px-3 py-1 rounded-full flex items-center gap-1">
                    {userInfo.role === "admin" ? (
                      <AdminPanelSettingsIcon className="text-indigo-300 text-sm" />
                    ) : (
                      <SecurityIcon className="text-indigo-300 text-sm" />
                    )}
                    <span>{userInfo.role.toUpperCase()}</span>
                  </span>
                </h1>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <p className="text-xs text-slate-400">Last login: {moment().format("MMM D, YYYY h:mm A")}</p>
                  <span className="flex items-center gap-1 text-emerald-400 text-xs">
                    <MdOutlineSecurity className="text-base" />
                    Admin Privileges Active
                  </span>
                </div>
              </div>
            </div>
            {/* Admin Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-slate-800/30 p-3 rounded-xl border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <FiActivity className="text-indigo-400 text-lg" />
                  <span className="text-xs sm:text-sm text-slate-300">System Load</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-blue-500 h-2 rounded-full"
                      style={{ width: "45%" }}
                    ></div>
                  </div>
                  <span className="text-xs text-slate-400">45%</span>
                </div>
              </div>
              <div className="bg-slate-800/30 p-3 rounded-xl border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <BsServer className="text-emerald-400 text-lg" />
                  <span className="text-xs sm:text-sm text-slate-300">Server Status</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                  <span className="text-xs sm:text-sm text-emerald-400">Operational</span>
                </div>
              </div>
              <div className="bg-slate-800/30 p-3 rounded-xl border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <MdOutlineDataThresholding className="text-amber-400 text-lg" />
                  <span className="text-xs sm:text-sm text-slate-300">Data Updates</span>
                </div>
                <div className="mt-2">
                  <span className="text-xs sm:text-sm text-slate-400">Sync: 2 mins ago</span>
                </div>
              </div>
              <div className="bg-slate-800/30 p-3 rounded-xl border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <OnlinePredictionIcon className="text-purple-400 text-lg" />
                  <span className="text-xs sm:text-sm text-slate-300">Active Sessions</span>
                </div>
                <div className="mt-2">
                  <span className="text-xs sm:text-sm text-purple-400">3 Connections</span>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-slate-800/30 to-slate-900/30 p-4 rounded-xl mt-3 hidden lg:block border border-slate-700">
              <h3 className="text-sm font-semibold text-slate-300 mb-3">Quick Actions</h3>
              <div className="flex gap-2 flex-wrap">
                <button className="flex items-center gap-2 text-slate-300 hover:text-indigo-400 p-2 rounded-lg bg-slate-800/50 hover:bg-indigo-500/10 transition-all">
                  <ReportIcon className="text-base" />
                  <span className="text-xs">Generate Report</span>
                </button>
                <button className="flex items-center gap-2 text-slate-300 hover:text-emerald-400 p-2 rounded-lg bg-slate-800/50 hover:bg-emerald-500/10 transition-all">
                  <DashboardIcon className="text-base" />
                  <span className="text-xs">Refresh Data</span>
                </button>
                <button className="flex items-center gap-2 text-slate-300 hover:text-amber-400 p-2 rounded-lg bg-slate-800/50 hover:bg-amber-500/10 transition-all">
                  <SettingsIcon className="text-base" />
                  <span className="text-xs">Settings</span>
                </button>
                <button className="flex items-center gap-2 text-slate-300 hover:text-purple-400 p-2 rounded-lg bg-slate-800/50 hover:bg-purple-500/10 transition-all">
                  <OnlinePredictionIcon className="text-base" />
                  <span className="text-xs">Session Log</span>
                </button>
              </div>
            </div>
          </div>
          {/* Notifications and Quick Actions (Mobile/Tablet) */}
          <div className="w-full md:w-72 space-y-4">
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-4 rounded-2xl border border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-300">Notifications</h3>
                <span className="text-xs text-indigo-400 cursor-pointer">Mark all read</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-2 bg-slate-800/30 rounded-xl">
                  <div className="p-2 bg-emerald-500/20 rounded-lg mt-1">
                    <NotificationsActiveIcon className="text-emerald-400 text-lg" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-100">5 new orders received</p>
                    <p className="text-xs text-slate-400 mt-1">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-2 bg-slate-800/30 rounded-xl">
                  <div className="p-2 bg-rose-500/20 rounded-lg mt-1">
                    <LocalPostOfficeTwoToneIcon className="text-rose-400 text-lg" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-100">3 urgent messages</p>
                    <p className="text-xs text-slate-400 mt-1">15 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-2 bg-slate-800/30 rounded-xl">
                  <div className="p-2 bg-amber-500/20 rounded-lg mt-1">
                    <FiShoppingBag className="text-amber-400 text-lg" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-100">New seller registered</p>
                    <p className="text-xs text-slate-400 mt-1">1 hour ago</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-4 rounded-2xl block lg:hidden border border-slate-700">
              <h3 className="text-sm font-semibold text-slate-300 mb-3">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-2">
                <button className="flex items-center justify-center gap-1 text-slate-300 hover:text-indigo-400 p-2 rounded-lg bg-slate-800/50 hover:bg-indigo-500/10 transition-all">
                  <ReportIcon className="text-sm" />
                  <span className="text-xs">Report</span>
                </button>
                <button className="flex items-center justify-center gap-1 text-slate-300 hover:text-emerald-400 p-2 rounded-lg bg-slate-800/50 hover:bg-emerald-500/10 transition-all">
                  <DashboardIcon className="text-sm" />
                  <span className="text-xs">Refresh</span>
                </button>
                <button className="flex items-center justify-center gap-1 text-slate-300 hover:text-amber-400 p-2 rounded-lg bg-slate-800/50 hover:bg-amber-500/10 transition-all">
                  <SettingsIcon className="text-sm" />
                  <span className="text-xs">Settings</span>
                </button>
                <button className="flex items-center justify-center gap-1 text-slate-300 hover:text-purple-400 p-2 rounded-lg bg-slate-800/50 hover:bg-purple-500/10 transition-all">
                  <OnlinePredictionIcon className="text-sm" />
                  <span className="text-xs">Sessions</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          icon={<BsCurrencyDollar />}
          title="Total Revenue"
          value={`₦${totalSale}`}
          trend="+24%"
          colorClass="bg-gradient-to-br from-emerald-600 to-teal-500"
        />
        <MetricCard
          icon={<BsBoxSeam />}
          title="Total Products"
          value={totalProduct}
          trend="+12%"
          colorClass="bg-gradient-to-br from-amber-600 to-orange-500"
        />
        <MetricCard
          icon={<FiShoppingBag />}
          title="Total Orders"
          value={totalOrder}
          trend="+8%"
          colorClass="bg-gradient-to-br from-orange-600 to-amber-500"
        />
        <MetricCard
          icon={<FiUsers />}
          title="Active Sellers"
          value={totalSeller}
          trend="+3%"
          colorClass="bg-gradient-to-br from-indigo-600 to-purple-500"
        />
      </div>
      {/* Chart & Messages Section */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="lg:w-7/12 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-4 md:p-6 rounded-2xl border border-slate-700 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-100">Monthly Analytics</h3>
            <div className="flex gap-2">
              <button className="text-xs px-3 py-1 rounded-lg bg-slate-800/50 text-slate-300 hover:bg-indigo-500/10 hover:text-indigo-400 transition-all">
                Monthly
              </button>
              <button className="text-xs px-3 py-1 rounded-lg bg-slate-800/50 text-slate-300 hover:bg-indigo-500/10 hover:text-indigo-400 transition-all">
                Quarterly
              </button>
              <button className="text-xs px-3 py-1 rounded-lg bg-slate-800/50 text-slate-300 hover:bg-indigo-500/10 hover:text-indigo-400 transition-all">
                Yearly
              </button>
            </div>
          </div>
          <Chart options={chartOptions} series={chartSeries} type="bar" height={350} />
        </div>
        {/* Recent Messages Section */}
        <div className="lg:w-5/12 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-4 md:p-6 rounded-2xl border border-slate-700 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-lg text-slate-100">Recent Messages</h2>
            <Link className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors" to="#">
              View All
            </Link>
          </div>
          <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
            {recentMessage.map((m, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-4 bg-slate-800/30 rounded-xl border border-slate-700 hover:border-indigo-500/50 transition-all"
              >
                <div className="relative flex-shrink-0">
                  {m.senderId === userInfo._id ? (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
                      <span className="text-sm font-bold text-indigo-100">{userInfo.name[0]}</span>
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-600 to-orange-500 flex items-center justify-center shadow-lg">
                      <img className="w-6 h-6" src={seller || "/placeholder.svg"} alt="Seller" />
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-slate-100">{m.senderName}</span>
                    <time className="text-xs text-slate-500">{moment(m.createdAt).startOf("hour").fromNow()}</time>
                  </div>
                  <p className="text-sm text-slate-400 bg-slate-800/50 p-3 rounded-lg">
                    {m.message.length > 80 ? m.message.substring(0, 80) + "..." : m.message}
                  </p>
                </div>
              </div>
            ))}
            {recentMessage.length === 0 && (
              <div className="text-center py-8">
                <div className="inline-block p-4 rounded-full bg-slate-800/50 mb-3">
                  <LocalPostOfficeTwoToneIcon className="text-indigo-500 text-3xl" />
                </div>
                <p className="text-slate-400">No messages yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Recent Orders Table */}
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-slate-700 shadow-xl overflow-hidden">
        <div className="p-4 md:p-6 border-b border-slate-700">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-100">Recent Orders</h3>
            <Link className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors" to="#">
              View All
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-800/30 text-slate-300">
              <tr>
                <th className="p-3 text-left text-xs md:text-sm">Order ID</th>
                <th className="p-3 text-left text-xs md:text-sm">Price</th>
                <th className="p-3 text-left text-xs md:text-sm">Payment</th>
                <th className="p-3 text-left text-xs md:text-sm">Status</th>
                <th className="p-3 text-right text-xs md:text-sm">Action</th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              {recentOrders.map((d, i) => (
                <tr key={i} className="border-b border-slate-700 hover:bg-slate-800/10 transition-colors">
                  <td className="p-3 text-xs md:text-sm">#{d._id.substring(0, 8)}</td>
                  <td className="p-3 text-xs md:text-sm">${d.price}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        d.payment_status === "completed"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-amber-500/20 text-amber-400"
                      }`}
                    >
                      {d.payment_status}
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        d.delivery_status === "delivered"
                          ? "bg-indigo-500/20 text-indigo-400"
                          : "bg-slate-500/20 text-slate-400"
                      }`}
                    >
                      {d.delivery_status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <Link
                      to={`/admin/dashboard/order/details/${d._id}`}
                      className="text-xs md:text-sm text-indigo-400 hover:text-indigo-300 transition-colors inline-flex items-center gap-1"
                    >
                      Details
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {recentOrders.length === 0 && (
            <div className="text-center py-8">
              <div className="inline-block p-4 rounded-full bg-slate-800/50 mb-3">
                <FiShoppingBag className="text-indigo-500 text-3xl" />
              </div>
              <p className="text-slate-400">No recent orders</p>
            </div>
          )}
        </div>
      </div>
      <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #4b5563;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #3b82f6;
                }
            `}</style>
    </div>
  )
}
export default AdminDashboard
