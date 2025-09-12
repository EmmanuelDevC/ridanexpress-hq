// src/pages/seller/EditProduct.js
import React, { useEffect, useState, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { PropagateLoader } from 'react-spinners';
import toast from 'react-hot-toast';
import { get_category } from '../../store/Reducers/categoryReducer';
import { get_product, messageClear, update_product, product_image_update } from '../../store/Reducers/productReducer';
import JoditEditor from 'jodit-react';
import { FiImage, FiX, FiChevronDown, FiChevronUp, FiArrowLeft } from 'react-icons/fi';
import { overrideStyle } from '../../utils/utils';

const EditProduct = () => {
    const editor = useRef(null);
    const [content, setContent] = useState('');
    const { productId } = useParams();
    const dispatch = useDispatch();
    const { categorys } = useSelector(state => state.category);
    const { product, loader, errorMessage, successMessage } = useSelector(state => state.product);
    
    const [state, setState] = useState({
        name: "",
        description: '',
        discount: '',
        price: "",
        brand: "",
        stock: ""
    });
    
    const [cateShow, setCateShow] = useState(false);
    const [category, setCategory] = useState('');
    const [allCategory, setAllCategory] = useState([]);
    const [searchValue, setSearchValue] = useState('');
    const [imageShow, setImageShow] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        dispatch(get_category({
            searchValue: '',
            parPage: '',
            page: ""
        }));
    }, [dispatch]);

    useEffect(() => {
        dispatch(get_product(productId));
    }, [productId, dispatch]);

    useEffect(() => {
        if (product && Object.keys(product).length > 0) {
            setState({
                name: product.name || "",
                description: product.description || '',
                discount: product.discount != null ? String(product.discount) : '',
                price: product.price != null ? String(product.price) : "",
                brand: product.brand || "",
                stock: product.stock != null ? String(product.stock) : ""
            });
            setContent(product.description || '');
            setCategory(product.category || '');
            setImageShow(product.images || []);
            setIsLoading(false);
        }
    }, [product]);

    useEffect(() => {
        if (categorys.length > 0) {
            setAllCategory(categorys);
        }
    }, [categorys]);

    useEffect(() => {
        if (errorMessage) {
            toast.error(errorMessage);
            dispatch(messageClear());
        }
        if (successMessage) {
            toast.success(successMessage);
            dispatch(messageClear());
        }
    }, [successMessage, errorMessage, dispatch]);

    const inputHandle = (e) => {
        setState({
            ...state,
            [e.target.name]: e.target.value
        });
    };

    const categorySearch = (e) => {
        const value = e.target.value;
        setSearchValue(value);
        if (value) {
            let srcValue = categorys.filter(c => 
                c.name.toLowerCase().includes(value.toLowerCase())
            );
            setAllCategory(srcValue);
        } else {
            setAllCategory(categorys);
        }
    };

    const changeImage = (img, files) => {
        if (files.length > 0) {
            dispatch(product_image_update({
                oldImage: img,
                newImage: files[0],
                productId
            }));
        }
    };

    const update = (e) => {
        e.preventDefault();
        const obj = {
            name: state.name,
            description: content,
            discount: state.discount ? Number(state.discount) : 0,
            price: state.price ? Number(state.price) : 0,
            brand: state.brand,
            stock: state.stock ? Number(state.stock) : 0,
            productId: productId,
            category
        };
        dispatch(update_product(obj));
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 to-gray-900">
                <PropagateLoader color='#6366f1' cssOverride={overrideStyle} size={20} />
            </div>
        );
    }

    return (
        <div className='min-h-screen bg-gradient-to-b from-slate-900 to-gray-900 px-2 sm:px-4 lg:px-6 py-4 sm:py-6'>
            <div className='max-w-7xl mx-auto'>
                <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4'>
                    <div>
                        <h1 className='text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2'>
                            Edit Product
                        </h1>
                        <p className='text-gray-400 text-sm sm:text-base'>
                            Update your product details
                        </p>
                    </div>
                    <Link 
                        className='flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg px-4 py-2.5 transition-all shadow-lg text-sm sm:text-base'
                        to='/seller/dashboard/products'
                    >
                        <FiArrowLeft className="text-sm" /> Back to Products
                    </Link>
                </div>
                
                <div className='bg-gray-800/30 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-gray-700 shadow-xl p-4 sm:p-6'>
                    <form onSubmit={update}>
                        <div className='grid grid-cols-1 gap-4 sm:gap-6 mb-6'>
                            <div className="relative">
                                <label className='block text-gray-400 text-sm mb-2' htmlFor="name">Product Name</label>
                                <input 
                                    className='w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-white text-sm sm:text-base'
                                    onChange={inputHandle} 
                                    value={state.name} 
                                    type="text" 
                                    placeholder='Enter product name' 
                                    name='name' 
                                    id='name' 
                                />
                            </div>
                            
                            <div className="relative">
                                <label className='block text-gray-400 text-sm mb-2' htmlFor="brand">Brand</label>
                                <input 
                                    className='w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-white text-sm sm:text-base'
                                    onChange={inputHandle} 
                                    value={state.brand} 
                                    type="text" 
                                    placeholder='Enter brand name' 
                                    name='brand' 
                                    id='brand' 
                                />
                            </div>
                            
                            <div className="relative">
                                <label className='block text-gray-400 text-sm mb-2' htmlFor="category">Category</label>
                                <div className="relative">
                                    <div 
                                        onClick={() => setCateShow(!cateShow)}
                                        className="flex items-center justify-between w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg cursor-pointer text-gray-300 text-sm sm:text-base"
                                    >
                                        {category || 'Select a category'}
                                        {cateShow ? <FiChevronUp /> : <FiChevronDown />}
                                    </div>
                                    
                                    {cateShow && (
                                        <div className="absolute top-full left-0 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10 overflow-hidden">
                                            <div className='p-3 border-b border-gray-700'>
                                                <input 
                                                    value={searchValue} 
                                                    onChange={categorySearch}
                                                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-white text-sm"
                                                    type="text" 
                                                    placeholder='Search categories...' 
                                                />
                                            </div>
                                            <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                                {allCategory.map((c, i) => (
                                                    <div 
                                                        key={i}
                                                        className={`px-4 py-3 hover:bg-gray-700/50 cursor-pointer text-sm ${category === c.name ? 'bg-indigo-900/30' : ''}`}
                                                        onClick={() => {
                                                            setCateShow(false);
                                                            setCategory(c.name);
                                                            setSearchValue('');
                                                        }}
                                                    >
                                                        {c.name}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="relative">
                                <label className='block text-gray-400 text-sm mb-2' htmlFor="stock">Stock Quantity</label>
                                <input 
                                    className='w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-white text-sm sm:text-base'
                                    onChange={inputHandle} 
                                    value={state.stock} 
                                    type="number" 
                                    min='0' 
                                    placeholder='Enter stock quantity' 
                                    name='stock' 
                                    id='stock' 
                                />
                            </div>
                            
                            <div className="relative">
                                <label className='block text-gray-400 text-sm mb-2' htmlFor="price">Price ($)</label>
                                <input 
                                    className='w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-white text-sm sm:text-base'
                                    onChange={inputHandle} 
                                    value={state.price} 
                                    type="number" 
                                    placeholder='Enter price' 
                                    name='price' 
                                    id='price' 
                                />
                            </div>
                            
                            <div className="relative">
                                <label className='block text-gray-400 text-sm mb-2' htmlFor="discount">Discount (%)</label>
                                <input 
                                    className='w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-white text-sm sm:text-base'
                                    onChange={inputHandle} 
                                    value={state.discount} 
                                    type="number" 
                                    placeholder='Enter discount percentage' 
                                    name='discount' 
                                    id='discount' 
                                />
                            </div>
                        </div>
                        
                        <div className='mb-6'>
                            <label className='block text-gray-400 text-sm mb-2' htmlFor="description">Description</label>
                            <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                                <JoditEditor
                                    ref={editor}
                                    value={content}
                                    tabIndex={1}
                                    onBlur={newContent => setContent(newContent)}
                                    config={{
                                        readonly: false,
                                        theme: 'dark',
                                        height: 300,
                                        style: {
                                            backgroundColor: '#1f2937',
                                            color: '#f3f4f6'
                                        },
                                        buttons: [
                                            'source', '|', 
                                            'bold', 'italic', 'underline', 'strikethrough', '|',
                                            'ul', 'ol', '|',
                                            'font', 'fontsize', 'brush', 'paragraph', '|',
                                            'image', 'video', 'table', 'link', '|',
                                            'align', 'undo', 'redo', '|',
                                            'hr', 'eraser', 'fullsize'
                                        ],
                                        toolbarAdaptive: true
                                    }}
                                />
                            </div>
                        </div>
                        
                        <div className='mb-8'>
                            <label className='block text-gray-400 text-sm mb-4'>Product Images</label>
                            <div className='grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4'>
                                {imageShow.map((img, i) => (
                                    <div key={i} className="relative group">
                                        <label 
                                            className="block h-32 sm:h-40 w-full bg-gray-800 border-2 border-dashed border-gray-700 rounded-lg overflow-hidden cursor-pointer hover:border-indigo-500 transition-all"
                                            htmlFor={`image-${i}`}
                                        >
                                            <img 
                                                className="w-full h-full object-contain" 
                                                src={img} 
                                                alt={`Product ${i+1}`} 
                                            />
                                            <div className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <FiImage className="text-lg sm:text-xl text-white" />
                                                <span className="ml-1 text-white text-xs sm:text-sm">Change</span>
                                            </div>
                                        </label>
                                        <input 
                                            onChange={(e) => changeImage(img, e.target.files)}
                                            type="file" 
                                            id={`image-${i}`} 
                                            className="hidden" 
                                            accept="image/*"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div className='flex justify-end'>
                            <button 
                                disabled={loader} 
                                className={`w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg px-6 py-3 font-medium transition-all shadow-lg text-sm sm:text-base ${loader ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-indigo-500/30'}`}
                            >
                                {loader ? (
                                    <PropagateLoader color='#fff' cssOverride={overrideStyle} size={12} />
                                ) : 'Update Product'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
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
    );
};

export default EditProduct;