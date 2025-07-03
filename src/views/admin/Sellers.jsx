import React, { useEffect, useState } from 'react'
import { FaEye, FaSearch } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import Pagination from '../Pagination'
import { useDispatch, useSelector } from 'react-redux'
import { get_active_sellers } from '../../store/Reducers/sellerReducer'

const Sellers = () => {
    const dispatch = useDispatch()
    const [currentPage, setCurrentPage] = useState(1)
    const [searchValue, setSearchValue] = useState('')
    const [parPage, setParPage] = useState(5)
    const { sellers, totalSellers } = useSelector(state => state.seller)

    useEffect(() => {
        dispatch(get_active_sellers({
            parPage: parseInt(parPage),
            page: parseInt(currentPage),
            searchValue
        }))
    }, [searchValue, currentPage, parPage])

    return (
        <div className='px-4 lg:px-8 py-6 bg-gray-900 min-h-screen'>
            <div className='bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-700'>
                <div className='px-6 py-5 border-b border-gray-700'>
                    <h2 className='text-2xl font-bold text-white'>Active Sellers</h2>
                    <div className='mt-4 flex flex-col md:flex-row justify-between gap-4'>
                        <div className='relative flex-1 max-w-md'>
                            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                                <FaSearch className='text-gray-400' />
                            </div>
                            <input
                                onChange={e => setSearchValue(e.target.value)}
                                value={searchValue}
                                className='block w-full pl-10 pr-3 py-2.5 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-white'
                                type="text"
                                placeholder='Search sellers...'
                            />
                        </div>
                        
                        <div className='flex items-center space-x-3'>
                            <span className='text-gray-300 whitespace-nowrap'>Show:</span>
                            <select 
                                onChange={(e) => setParPage(parseInt(e.target.value))} 
                                className='px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-white'
                            >
                                <option value="5">5</option>
                                <option value="15">15</option>
                                <option value="25">25</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <div className='overflow-x-auto'>
                    <table className='min-w-full divide-y divide-gray-700'>
                        <thead className='bg-gray-750'>
                            <tr>
                                <th scope='col' className='px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'>#</th>
                                <th scope='col' className='px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'>Seller</th>
                                <th scope='col' className='px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'>Shop</th>
                                <th scope='col' className='px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'>Status</th>
                                <th scope='col' className='px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'>Contact</th>
                                <th scope='col' className='px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'>Location</th>
                                <th scope='col' className='px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider'>Actions</th>
                            </tr>
                        </thead>
                        <tbody className='bg-gray-800 divide-y divide-gray-700'>
                            {sellers.map((d, i) => (
                                <tr key={i} className='hover:bg-gray-750 transition-colors'>
                                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-white'>{i + 1}</td>
                                    
                                    <td className='px-6 py-4 whitespace-nowrap'>
                                        <div className='flex items-center'>
                                            <div className='flex-shrink-0 h-10 w-10'>
                                                <img 
                                                    className='h-10 w-10 rounded-full object-cover border-2 border-gray-700' 
                                                    src={d.image} 
                                                    alt={d.name} 
                                                />
                                            </div>
                                            <div className='ml-4'>
                                                <div className='text-sm font-medium text-white'>{d.name}</div>
                                                <div className='text-sm text-gray-400'>{d.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    
                                    <td className='px-6 py-4 whitespace-nowrap'>
                                        <div className='text-sm font-medium text-white'>{d.shopInfo?.shopName}</div>
                                    </td>
                                    
                                    <td className='px-6 py-4 whitespace-nowrap'>
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            d.status === 'active' 
                                                ? 'bg-green-900/40 text-green-300' 
                                                : 'bg-yellow-900/40 text-yellow-300'
                                        }`}>
                                            {d.status}
                                        </span>
                                    </td>
                                    
                                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-400'>
                                        {d.email}
                                    </td>
                                    
                                    <td className='px-6 py-4 whitespace-nowrap'>
                                        <div className='text-sm text-white'>{d.shopInfo?.division}</div>
                                        <div className='text-sm text-gray-400'>{d.shopInfo?.district}</div>
                                    </td>
                                    
                                    <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                                        <Link 
                                            to={`/admin/dashboard/seller/details/${d._id}`} 
                                            className='inline-flex items-center p-2 bg-blue-600 rounded-lg text-white hover:bg-blue-700 transition-colors'
                                            title='View Details'
                                        >
                                            <FaEye className='w-4 h-4' />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    
                    {sellers.length === 0 && (
                        <div className='text-center py-12'>
                            <div className='text-gray-400'>No sellers found</div>
                        </div>
                    )}
                </div>
                
                {totalSellers > parPage && (
                    <div className='px-6 py-4 border-t border-gray-700'>
                        <Pagination
                            pageNumber={currentPage}
                            setPageNumber={setCurrentPage}
                            totalItem={totalSellers}
                            parPage={parPage}
                            showItem={4}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}

export default Sellers