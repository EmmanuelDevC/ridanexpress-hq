import React, { useEffect, useState } from 'react'
import { FaEye, FaSearch } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import Pagination from '../Pagination'
import { useDispatch, useSelector } from 'react-redux'
import { get_deactive_sellers } from '../../store/Reducers/sellerReducer'

const DeactiveSellers = () => {
    const [currentPage, setCurrentPage] = useState(1)
    const [searchValue, setSearchValue] = useState('')
    const [parPage, setParPage] = useState(5)
    const { sellers, totalSellers } = useSelector(state => state.seller)
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(get_deactive_sellers({
            parPage: parseInt(parPage),
            page: parseInt(currentPage),
            searchValue
        }))
    }, [searchValue, currentPage, parPage])

    return (
        <div className='px-4 lg:px-8 py-6 bg-gray-900 min-h-screen'>
            <div className='bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-700'>
                <div className='px-6 py-5 border-b border-gray-700'>
                    <h2 className='text-2xl font-bold text-white'>Deactivated Sellers</h2>
                    <div className='mt-4 flex flex-col md:flex-row justify-between gap-4'>
                        <div className='relative flex-1 max-w-md'>
                            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                                <FaSearch className='text-gray-400' />
                            </div>
                            <input
                                onChange={e => setSearchValue(e.target.value)}
                                value={searchValue}
                                className='block w-full pl-10 pr-3 py-2.5 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition text-white'
                                type="text"
                                placeholder='Search sellers...'
                            />
                        </div>
                        
                        <div className='flex items-center space-x-3'>
                            <span className='text-gray-300 whitespace-nowrap'>Show:</span>
                            <select 
                                onChange={(e) => setParPage(parseInt(e.target.value))} 
                                className='px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition text-white'
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
                                                    src={`/images/category/${d.image}.jpg`} 
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
                                        <div className='text-sm font-medium text-white'>{d.shopInfo?.shopName || 'N/A'}</div>
                                    </td>
                                    
                                    <td className='px-6 py-4 whitespace-nowrap'>
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            d.status === 'deactive' 
                                                ? 'bg-rose-900/40 text-rose-300' 
                                                : 'bg-gray-700 text-gray-300'
                                        }`}>
                                            {d.status}
                                        </span>
                                    </td>
                                    
                                    <td className='px-6 py-4 whitespace-nowrap'>
                                        <div className='text-sm text-white'>{d.shopInfo?.division || 'N/A'}</div>
                                        <div className='text-sm text-gray-400'>{d.shopInfo?.district || 'N/A'}</div>
                                    </td>
                                    
                                    <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                                        <div className='flex justify-end'>
                                            <Link 
                                                to={`/admin/dashboard/seller/details/${d._id}`} 
                                                className='inline-flex items-center p-2 bg-gray-600 rounded-lg text-white hover:bg-gray-500 transition-colors'
                                                title='View Details'
                                            >
                                                <FaEye className='w-4 h-4' />
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            
                            {sellers.length === 0 && (
                                <tr>
                                    <td colSpan="6" className='px-6 py-8 text-center'>
                                        <div className='text-gray-400 italic'>No deactivated sellers found</div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
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

export default DeactiveSellers