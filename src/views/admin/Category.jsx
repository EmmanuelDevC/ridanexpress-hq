import React, { useEffect, useState } from 'react'
import { FaEdit, FaTrash, FaPlus, FaMinus, FaTimes, FaChevronDown } from 'react-icons/fa'
import { PropagateLoader } from 'react-spinners'
import { overrideStyle } from '../../utils/utils'
import { BsImage } from 'react-icons/bs'
import toast from 'react-hot-toast'
import { useSelector, useDispatch } from 'react-redux'
import { categoryAdd, messageClear, get_category, delete_category } from '../../store/Reducers/categoryReducer'
import Search from '../components/Search'
import Pagination from '../Pagination'

const Category = () => {
    const dispatch = useDispatch()
    const { loader, successMessage, errorMessage, categorys } = useSelector(state => state.category)
    const [currentPage, setCurrentPage] = useState(1)
    const [searchValue, setSearchValue] = useState('')
    const [parPage, setParPage] = useState(5)
    const [showForm, setShowForm] = useState(false)
    const [imagePreview, setImagePreview] = useState('')
    const [openSubcategories, setOpenSubcategories] = useState(null);
    const [state, setState] = useState({
        name: '',
        image: '',
        subcategories: [],
        specificationGroups: [
            {
                title: 'KEY FEATURES',
                fields: [{ name: '' }]
            },
            {
                title: 'WHAT\'S IN THE BOX',
                fields: [{ name: '' }]
            },
            {
                title: 'SPECIFICATIONS',
                fields: [{ name: '' }]
            }
        ]
    })
    const [isEditing, setIsEditing] = useState(false)
    const [editId, setEditId] = useState(null)

    const imageHandle = (e) => {
        const file = e.target.files[0]
        if (file) {
            setImagePreview(URL.createObjectURL(file))
            setState(prev => ({
                ...prev,
                image: file
            }))
        }
    }

    const addSubcategory = () => {
        if (state.subcategories.length >= 10) {
            toast.error('Maximum 10 subcategories allowed')
            return
        }
        setState(prev => ({
            ...prev,
            subcategories: [...prev.subcategories, '']
        }))
    }

    const handleEditCategory = (category) => {
        setState({
            name: category.name,
            image: category.image,
            subcategories: category.subcategories || [],
            specificationGroups: category.specificationGroups || [
                { title: 'KEY FEATURES', fields: [{ name: '' }] },
                { title: 'WHAT\'S IN THE BOX', fields: [{ name: '' }] },
                { title: 'SPECIFICATIONS', fields: [{ name: '' }] }
            ]
        });
        setImagePreview(category.image);
        setShowForm(true);
        setIsEditing(true);
        setEditId(category._id);
    };

    const handleDeleteCategory = (categoryId) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            dispatch(delete_category(categoryId))
                .unwrap()
                .then(() => {
                    toast.success('Category deleted successfully');
                    dispatch(get_category({
                        parPage: parseInt(parPage),
                        page: parseInt(currentPage),
                        searchValue
                    }));
                })
                .catch(error => {
                    toast.error(error.error || 'Failed to delete category');
                });
        }
    };

    const handleSubcategoryChange = (index, value) => {
        const newSubcategories = [...state.subcategories]
        newSubcategories[index] = value
        setState(prev => ({
            ...prev,
            subcategories: newSubcategories
        }))
    }

    const removeSubcategory = (index) => {
        const newSubcategories = state.subcategories.filter((_, i) => i !== index)
        setState(prev => ({
            ...prev,
            subcategories: newSubcategories
        }))
    }

    // Specification Group Functions
    const addSpecificationGroup = () => {
        setState(prev => ({
            ...prev,
            specificationGroups: [
                ...prev.specificationGroups,
                {
                    title: '',
                    fields: [{ name: '' }]
                }
            ]
        }))
    }

    const removeSpecificationGroup = (index) => {
        if (state.specificationGroups.length <= 1) {
            toast.error('At least one specification group is required')
            return
        }
        const newGroups = [...state.specificationGroups]
        newGroups.splice(index, 1)
        setState(prev => ({
            ...prev,
            specificationGroups: newGroups
        }))
    }

    const updateGroupTitle = (index, value) => {
        const newGroups = [...state.specificationGroups]
        newGroups[index].title = value
        setState(prev => ({
            ...prev,
            specificationGroups: newGroups
        }))
    }

    const addSpecificationField = (groupIndex) => {
        const newGroups = [...state.specificationGroups]
        if (newGroups[groupIndex].fields.length >= 20) {
            toast.error('Maximum 20 fields per group')
            return
        }
        newGroups[groupIndex].fields.push({ name: '' })
        setState(prev => ({
            ...prev,
            specificationGroups: newGroups
        }))
    }

    const removeSpecificationField = (groupIndex, fieldIndex) => {
        const newGroups = [...state.specificationGroups]
        if (newGroups[groupIndex].fields.length <= 1) {
            toast.error('At least one field is required')
            return
        }
        newGroups[groupIndex].fields.splice(fieldIndex, 1)
        setState(prev => ({
            ...prev,
            specificationGroups: newGroups
        }))
    }

    const updateSpecificationField = (groupIndex, fieldIndex, value) => {
        const newGroups = [...state.specificationGroups]
        newGroups[groupIndex].fields[fieldIndex].name = value
        setState(prev => ({
            ...prev,
            specificationGroups: newGroups
        }))
    }

    const add_category = (e) => {
        e.preventDefault()
        if (state.subcategories.length > 10) {
            toast.error('Maximum 10 subcategories allowed')
            return
        }
        
        // Validate specification groups
        for (const group of state.specificationGroups) {
            if (!group.title.trim()) {
                toast.error('All specification groups must have a title')
                return
            }
            
            for (const field of group.fields) {
                if (!field.name.trim()) {
                    toast.error('All specification fields must have a name')
                    return
                }
            }
        }
        
        if (isEditing) {
            dispatch(categoryAdd({ ...state, id: editId }))
        } else {
            dispatch(categoryAdd(state))
        }
    }

    const resetForm = () => {
        setState({
            name: '',
            image: '',
            subcategories: [],
            specificationGroups: [
                { title: 'KEY FEATURES', fields: [{ name: '' }] },
                { title: 'WHAT\'S IN THE BOX', fields: [{ name: '' }] },
                { title: 'SPECIFICATIONS', fields: [{ name: '' }] }
            ]
        })
        setImagePreview('')
        setIsEditing(false)
        setEditId(null)
    }

    useEffect(() => {
        if (errorMessage) {
            toast.error(errorMessage)
            dispatch(messageClear())
        }
        if (successMessage) {
            toast.success(successMessage)
            dispatch(messageClear())
            resetForm()
            setShowForm(false)
        }
    }, [successMessage, errorMessage])

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (openSubcategories && !e.target.closest('.relative.inline-block')) {
                setOpenSubcategories(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [openSubcategories]);

    useEffect(() => {
        dispatch(get_category({
            parPage: parseInt(parPage),
            page: parseInt(currentPage),
            searchValue
        }))
    }, [searchValue, currentPage, parPage])

    return (
        <div className='px-4 lg:px-8 py-6 bg-gray-900 min-h-screen'>
            <div className='flex flex-col lg:flex-row gap-6'>
                {/* Main Content */}
                <div className={`flex-1 transition-all ${showForm ? 'lg:w-2/3' : 'w-full'}`}>
                    <div className='bg-gray-800 rounded-xl shadow-lg p-4 md:p-6 border border-gray-700'>
                        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4'>
                            <h1 className='text-2xl font-bold text-white'>Category Management</h1>
                            <button
                                onClick={() => {
                                    resetForm()
                                    setShowForm(true)
                                }}
                                className='bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all shadow-lg'
                            >
                                <FaPlus /> New Category
                            </button>
                        </div>

                        <Search
                            setParPage={setParPage}
                            setSearchValue={setSearchValue}
                            searchValue={searchValue}
                        />

                        <div className='overflow-x-auto rounded-xl border border-gray-700 mt-4'>
                            <table className='w-full'>
                                <thead className='bg-gray-750'>
                                    <tr>
                                        <th className='px-4 md:px-6 py-3 text-left text-sm font-medium text-gray-300'>Category</th>
                                        <th className='px-4 md:px-6 py-3 text-left text-sm font-medium text-gray-300 hidden sm:table-cell'>Subcategories</th>
                                        <th className='px-4 md:px-6 py-3 text-center text-sm font-medium text-gray-300'>Actions</th>
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-gray-700'>
                                    {categorys.length > 0 ? (
                                        categorys.map((category) => (
                                            <tr key={category._id} className='hover:bg-gray-750/50 transition-colors'>
                                                <td className='px-4 md:px-6 py-4'>
                                                    <div className='flex items-center gap-4'>
                                                        <img
                                                            src={category.image}
                                                            alt={category.name}
                                                            className='w-10 h-10 rounded-lg object-cover border border-gray-600'
                                                        />
                                                        <span className='font-medium text-white'>{category.name}</span>
                                                    </div>
                                                </td>
                                                <td className='px-4 md:px-6 py-4 hidden sm:table-cell'>
                                                    <div className='relative inline-block'>
                                                        <button
                                                            onClick={() => setOpenSubcategories(openSubcategories === category._id ? null : category._id)}
                                                            className='px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg text-sm transition-all flex items-center gap-1'
                                                        >
                                                            <span>View Subcategories</span>
                                                            <FaChevronDown className={`text-xs transition-transform ${openSubcategories === category._id ? 'rotate-180' : ''}`} />
                                                        </button>

                                                        {openSubcategories === category._id && (
                                                            <div className='absolute top-full left-0 mt-1 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50'>
                                                                <div className='max-h-40 overflow-y-auto py-2'>
                                                                    {category.subcategories?.map((sub, subIndex) => (
                                                                        <div
                                                                            key={subIndex}
                                                                            className='px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700/50 flex items-center gap-2'
                                                                        >
                                                                            <span className='w-1.5 h-1.5 rounded-full bg-emerald-500'></span>
                                                                            {sub}
                                                                        </div>
                                                                    ))}

                                                                    {category.subcategories?.length === 0 && (
                                                                        <div className='px-4 py-2 text-sm text-gray-500 italic'>
                                                                            No subcategories
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                <button
                                                                    onClick={() => setOpenSubcategories(null)}
                                                                    className='w-full text-xs text-gray-400 hover:text-gray-200 p-2 border-t border-gray-700'
                                                                >
                                                                    Close
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className='px-4 md:px-6 py-4'>
                                                    <div className='flex justify-center gap-3'>
                                                        <button
                                                            onClick={() => handleEditCategory(category)}
                                                            className='w-8 h-8 flex items-center justify-center rounded-full bg-gray-700 hover:bg-blue-600 text-blue-400 hover:text-white transition-all'
                                                            title='Edit Category'
                                                        >
                                                            <FaEdit size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteCategory(category._id)}
                                                            className='w-8 h-8 flex items-center justify-center rounded-full bg-gray-700 hover:bg-red-600 text-red-400 hover:text-white transition-all'
                                                            title='Delete Category'
                                                        >
                                                            <FaTrash size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="3" className='px-4 md:px-6 py-12 text-center'>
                                                <div className='flex flex-col items-center justify-center text-gray-500'>
                                                    <BsImage className='text-4xl mb-3 text-gray-600' />
                                                    <p>No categories found</p>
                                                    {searchValue && (
                                                        <button 
                                                            onClick={() => setSearchValue('')}
                                                            className='mt-3 text-sm text-emerald-400 hover:text-emerald-300'
                                                        >
                                                            Clear search
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className='mt-6'>
                            <Pagination
                                pageNumber={currentPage}
                                setPageNumber={setCurrentPage}
                                totalItem={50}
                                parPage={parPage}
                                showItem={4}
                            />
                        </div>
                    </div>
                </div>

                {/* Add/Edit Category Sidebar */}
                {showForm && (
                    <div className={`lg:w-1/3 fixed lg:static top-0 right-0 h-full lg:h-auto bg-gray-800 lg:bg-transparent shadow-xl lg:shadow-none transform transition-transform duration-300 ${showForm ? 'translate-x-0' : 'translate-x-full'} z-50`}>
                        <div className='h-full p-4 md:p-6 lg:rounded-xl lg:shadow-lg lg:border lg:border-gray-700'>
                            <div className='flex justify-between items-center mb-6'>
                                <h2 className='text-xl font-bold text-white'>
                                    {isEditing ? 'Edit Category' : 'New Category'}
                                </h2>
                                <button
                                    onClick={() => {
                                        setShowForm(false)
                                        resetForm()
                                    }}
                                    className='text-gray-400 hover:text-gray-200 transition-colors'
                                >
                                    <FaTimes size={20} />
                                </button>
                            </div>

                            <form onSubmit={add_category} className='space-y-4'>
                                <div>
                                    <label className='block text-sm font-medium text-gray-300 mb-2'>Category Name</label>
                                    <input
                                        type="text"
                                        value={state.name}
                                        onChange={(e) => setState(prev => ({ ...prev, name: e.target.value }))}
                                        className='w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-white'
                                        placeholder='Enter category name'
                                        required
                                    />
                                </div>

                                <div>
                                    <label className='block text-sm font-medium text-gray-300 mb-2'>Category Image</label>
                                    <label className='flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-emerald-500 transition-colors group relative overflow-hidden'>
                                        {imagePreview ? (
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className='w-full h-full object-cover'
                                            />
                                        ) : (
                                            <div className='text-center text-gray-500 group-hover:text-emerald-400 transition-colors'>
                                                <BsImage className='inline-block text-3xl mb-2' />
                                                <p className='text-sm'>Click to upload image</p>
                                                <p className='text-xs text-gray-500 mt-1'>Recommended: 300x300px</p>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            onChange={imageHandle}
                                            className='hidden'
                                            accept='image/*'
                                            required={!isEditing}
                                        />
                                        {imagePreview && (
                                            <div className='absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'>
                                                <span className='text-white text-sm'>Change Image</span>
                                            </div>
                                        )}
                                    </label>
                                </div>

                                <div>
                                    <div className='flex justify-between items-center mb-3'>
                                        <label className='text-sm font-medium text-gray-300'>Subcategories</label>
                                        <button
                                            type='button'
                                            onClick={addSubcategory}
                                            className='text-emerald-400 hover:text-emerald-300 flex items-center gap-1 text-sm'
                                            disabled={state.subcategories.length >= 10}
                                        >
                                            <FaPlus /> Add
                                        </button>
                                    </div>

                                    <div className='space-y-2 max-h-60 overflow-y-auto custom-scrollbar py-1'>
                                        {state.subcategories.map((sub, index) => (
                                            <div key={index} className='flex gap-2'>
                                                <input
                                                    type="text"
                                                    value={sub}
                                                    onChange={(e) => handleSubcategoryChange(index, e.target.value)}
                                                    placeholder={`Subcategory ${index + 1}`}
                                                    className='flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 text-white'
                                                    required
                                                />
                                                <button
                                                    type='button'
                                                    onClick={() => removeSubcategory(index)}
                                                    className='px-3 text-red-400 hover:text-red-300 transition-colors'
                                                >
                                                    <FaMinus />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Specification Groups Section */}
                                <div className='border-t border-gray-700 pt-4 mt-4'>
                                    <div className='flex justify-between items-center mb-3'>
                                        <h3 className='text-lg font-semibold text-white'>Specification Groups</h3>
                                        <button
                                            type='button'
                                            onClick={addSpecificationGroup}
                                            className='text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-sm'
                                        >
                                            <FaPlus /> Add Group
                                        </button>
                                    </div>

                                    <div className='space-y-4 max-h-96 overflow-y-auto custom-scrollbar py-1 pr-2'>
                                        {state.specificationGroups.map((group, groupIndex) => (
                                            <div key={groupIndex} className='bg-gray-750 rounded-lg p-4'>
                                                <div className='flex justify-between items-center mb-3'>
                                                    <input
                                                        type="text"
                                                        value={group.title}
                                                        onChange={(e) => updateGroupTitle(groupIndex, e.target.value)}
                                                        placeholder="Group Title (e.g., KEY FEATURES)"
                                                        className='flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 text-white font-medium'
                                                        required
                                                    />
                                                    <button
                                                        type='button'
                                                        onClick={() => removeSpecificationGroup(groupIndex)}
                                                        className='ml-2 px-3 text-red-400 hover:text-red-300 transition-colors'
                                                    >
                                                        <FaMinus />
                                                    </button>
                                                </div>

                                                <div className='space-y-2'>
                                                    <div className='flex justify-between items-center mb-2'>
                                                        <span className='text-sm text-gray-300'>Fields</span>
                                                        <button
                                                            type='button'
                                                            onClick={() => addSpecificationField(groupIndex)}
                                                            className='text-emerald-400 hover:text-emerald-300 flex items-center gap-1 text-xs'
                                                        >
                                                            <FaPlus size={10} /> Add Field
                                                        </button>
                                                    </div>

                                                    {group.fields.map((field, fieldIndex) => (
                                                        <div key={fieldIndex} className='flex gap-2 items-center'>
                                                            <input
                                                                type="text"
                                                                value={field.name}
                                                                onChange={(e) => updateSpecificationField(groupIndex, fieldIndex, e.target.value)}
                                                                placeholder="Field name (e.g., Model Name)"
                                                                className='flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 text-white text-sm'
                                                                required
                                                            />
                                                            <button
                                                                type='button'
                                                                onClick={() => removeSpecificationField(groupIndex, fieldIndex)}
                                                                className='px-2 text-red-400 hover:text-red-300 transition-colors'
                                                            >
                                                                <FaMinus size={12} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    type='submit'
                                    disabled={loader}
                                    className='w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-lg font-medium transition-all shadow-lg disabled:opacity-50'
                                >
                                    {loader ? (
                                        <PropagateLoader color='#fff' cssOverride={overrideStyle} />
                                    ) : isEditing ? (
                                        'Update Category'
                                    ) : (
                                        'Create Category'
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
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

export default Category