import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { BsImages, BsPlusLg, BsUpload } from 'react-icons/bs';
import { IoCloseSharp } from 'react-icons/io5';
import { useSelector, useDispatch } from 'react-redux';
import { HiOutlineCube, HiOutlineSparkles } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { PropagateLoader } from 'react-spinners';
import JoditEditor from 'jodit-react';
import { overrideStyle } from '../../utils/utils';
import { get_category } from '../../store/Reducers/categoryReducer';
import { add_product, messageClear } from '../../store/Reducers/productReducer';

const AddProduct = () => {
    const editor = useRef(null);
    const [content, setContent] = useState('');

    const dispatch = useDispatch();
    const { categorys } = useSelector(state => state.category);
    const { successMessage, errorMessage, loader } = useSelector(state => state.product);
    const { userInfo } = useSelector(state => state.auth);

    useEffect(() => {
        dispatch(get_category({
            searchValue: '',
            parPage: '',
            page: ""
        }));
    }, []);

    const [state, setState] = useState({
        name: "",
        description: '',
        discount: '',
        price: "",
        brand: "",
        stock: ""
    });

    const inputHandle = (e) => {
        setState({
            ...state,
            [e.target.name]: e.target.value
        });
    };

    const [cateShow, setCateShow] = useState(false);
    const [category, setCategory] = useState('');
    const [subcategory, setSubcategory] = useState('');
    const [allCategory, setAllCategory] = useState([]);
    const [searchValue, setSearchValue] = useState('');
    const [hoveredCategory, setHoveredCategory] = useState(null);

    const categorySearch = (e) => {
        const value = e.target.value;
        setSearchValue(value);
        if (value) {
            let srcValue = categorys.filter(c => c.name.toLowerCase().indexOf(value.toLowerCase()) > -1);
            setAllCategory(srcValue);
        } else {
            setAllCategory(categorys);
        }
    };

    // Specifications state
    const [specifications, setSpecifications] = useState({});
    const [categorySpecs, setCategorySpecs] = useState([]);

    useEffect(() => {
        if (category) {
            const selectedCategory = categorys.find(c => c.name === category);
            if (selectedCategory && selectedCategory.specificationGroups) {
                // Flatten all specification fields from all groups
                const allSpecs = [];
                selectedCategory.specificationGroups.forEach(group => {
                    group.fields.forEach(field => {
                        allSpecs.push(field.name);
                    });
                });
                setCategorySpecs(allSpecs);

                // Initialize specifications object with empty values
                const initialSpecs = {};
                allSpecs.forEach(spec => {
                    initialSpecs[spec] = '';
                });
                setSpecifications(initialSpecs);
            }
        }
    }, [category, categorys]);

    const handleSpecChange = (spec, value) => {
        setSpecifications({
            ...specifications,
            [spec]: value
        });
    };

    const [images, setImages] = useState([]);
    const [imageShow, setImageShow] = useState([]);

    const imageHandle = (e) => {
        const files = e.target.files;
        const length = files.length;

        if (length > 0) {
            if (images.length + length > 8) {
                toast.error('Maximum 8 images allowed');
                return;
            }

            setImages([...images, ...files]);
            let imageUrl = [];

            for (let i = 0; i < length; i++) {
                imageUrl.push({ url: URL.createObjectURL(files[i]) });
            }
            setImageShow([...imageShow, ...imageUrl]);
        }
    };

    const changeImage = (img, index) => {
        if (img) {
            let tempUrl = [...imageShow];
            let tempImages = [...images];

            tempImages[index] = img;
            tempUrl[index] = { url: URL.createObjectURL(img) };
            setImageShow(tempUrl);
            setImages(tempImages);
        }
    };

    const removeImage = (i) => {
        const filterImage = images.filter((img, index) => index !== i);
        const filterImageUrl = imageShow.filter((img, index) => index !== i);
        setImages(filterImage);
        setImageShow(filterImageUrl);
    };

    useEffect(() => {
        setAllCategory(categorys);
    }, [categorys]);

    const add = (e) => {
        e.preventDefault();
        if (!category) {
            toast.error('Please select a category');
            return;
        }
        if (images.length === 0) {
            toast.error('Please add at least one image');
            return;
        }

        const formData = new FormData();
        formData.append('name', state.name);
        formData.append('description', content);
        formData.append('price', state.price);
        formData.append('stock', state.stock);
        formData.append('category', category);
        formData.append('subcategory', subcategory);
        formData.append('discount', state.discount);
        formData.append('shopName', userInfo?.shopInfo?.shopName);
        formData.append('brand', state.brand);
        formData.append('specifications', JSON.stringify(specifications));

        for (let i = 0; i < images.length; i++) {
            formData.append('images', images[i]);
        }

        dispatch(add_product(formData));
    };

    useEffect(() => {
        if (errorMessage) {
            toast.error(errorMessage);
            dispatch(messageClear());
        }
        if (successMessage) {
            toast.success(successMessage);
            dispatch(messageClear());
            setState({
                name: "",
                description: '',
                discount: '',
                price: "",
                brand: "",
                stock: ""
            });
            setContent('');
            setImageShow([]);
            setImages([]);
            setCategory('');
            setSubcategory('');
            setSpecifications({});
            setCategorySpecs([]);
        }
    }, [successMessage, errorMessage]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-slate-900 py-8 px-2 sm:px-4">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-3 shadow-lg shadow-indigo-500/25">
                        <HiOutlineSparkles className="w-5 h-5 text-white" />
                    </div>
                    <h1 className="text-2xl md:text-4xl lg:text-3xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent mb-4">
                        Create New Product
                    </h1>
                    <p className="text-gray-400 text-md max-w-2xl mx-auto mb-8">
                        Add a new product to your store with detailed information and specifications
                    </p>
                    <Link
                        to="/seller/dashboard/products"
                        className="inline-flex text-sm items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 px-6 py-3 rounded-full font-semibold text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-105"
                    >
                        <HiOutlineCube className=" text-sm rounded-sm w-5 h-5" />
                        View All Products
                    </Link>
                </div>

                <div className="bg-gradient-to-br from-gray-800/50 to-slate-800/50 rounded-2xl border border-slate-700 shadow-xl overflow-hidden">
                    <div className="p-5 md:p-6 border-b border-slate-700">
                        <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 flex items-center justify-center">
                                <BsPlusLg className="text-white" />
                            </div>
                            Product Information
                        </h2>
                        <p className="text-gray-400 text-sm mt-2">
                            Fill in all required fields to add a new product
                        </p>
                    </div>

                    <form onSubmit={add} className="p-4 md:p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left Column */}
                            <div className="space-y-5">
                                <div className="flex flex-col gap-2">
                                    <label className="text-gray-300 font-medium flex items-center gap-2">
                                        Product Name
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        className="px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-gray-700/70 border border-slate-600 rounded-xl text-gray-200 placeholder-gray-500 transition-all"
                                        onChange={inputHandle}
                                        value={state.name}
                                        type="text"
                                        placeholder="Enter product name"
                                        name="name"
                                        id="name"
                                        required
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-gray-300 font-medium flex items-center gap-2">
                                        Product Brand
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        className="px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-gray-700/70 border border-slate-600 rounded-xl text-gray-200 placeholder-gray-500 transition-all"
                                        onChange={inputHandle}
                                        value={state.brand}
                                        type="text"
                                        placeholder="Enter product brand"
                                        name="brand"
                                        id="brand"
                                        required
                                    />
                                </div>

                                <div className="flex flex-col gap-2 relative">
                                    <label className="text-gray-300 font-medium flex items-center gap-2">
                                        Category & Subcategory
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <div
                                        onClick={() => setCateShow(!cateShow)}
                                        className="px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-gray-700/70 border border-slate-600 rounded-xl text-gray-200 placeholder-gray-500 cursor-pointer flex justify-between items-center"
                                    >
                                        <span className={category ? 'text-white' : 'text-gray-500'}>
                                            {category
                                                ? (subcategory ? `${category} > ${subcategory}` : category)
                                                : "Select category"}
                                        </span>
                                        <svg
                                            className={`w-4 h-4 text-gray-400 transition-transform ${cateShow ? 'rotate-180' : ''}`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                        </svg>
                                    </div>
                                    <div
                                        className={`absolute top-full left-0 right-0 mt-2 bg-gray-800 rounded-xl shadow-xl z-10 overflow-hidden transition-all ${cateShow ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
                                    >
                                        <div className="p-3 border-b border-slate-700">
                                            <input
                                                value={searchValue}
                                                onChange={categorySearch}
                                                className="px-4 py-2 w-full focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-700 border border-slate-600 rounded-lg text-gray-200 placeholder-gray-500 transition-all"
                                                type="text"
                                                placeholder="Search categories..."
                                                autoFocus
                                            />
                                        </div>
                                        <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                            {allCategory.length > 0 ? (
                                                allCategory.map((c, i) => (
                                                    <div
                                                        key={i}
                                                        className="relative"
                                                        onMouseEnter={() => setHoveredCategory(c._id)}
                                                        onMouseLeave={() => setHoveredCategory(null)}
                                                    >
                                                        <div
                                                            className={`px-4 py-3 hover:bg-indigo-900/50 cursor-pointer transition-colors flex justify-between items-center ${category === c.name ? 'bg-indigo-900/30 text-indigo-300' : 'text-gray-300'}`}
                                                            onClick={() => {
                                                                setCategory(c.name);
                                                                setSubcategory('');
                                                                setCateShow(c.subcategories?.length > 0);
                                                                if (c.subcategories?.length === 0) {
                                                                    setCateShow(false);
                                                                }
                                                            }}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                                                {c.name}
                                                            </div>
                                                            {c.subcategories?.length > 0 && (
                                                                <svg
                                                                    className="w-4 h-4 text-gray-400"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    viewBox="0 0 24 24"
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                >
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                                                                </svg>
                                                            )}
                                                        </div>

                                                        {/* Subcategories dropdown */}
                                                        {hoveredCategory === c._id && c.subcategories?.length > 0 && (
                                                            <div className="absolute left-full top-0 ml-1 w-48 bg-gray-800 border border-slate-700 rounded-lg shadow-lg z-20">
                                                                <div className="max-h-60 overflow-y-auto custom-scrollbar py-2">
                                                                    {c.subcategories.map((sub, idx) => (
                                                                        <div
                                                                            key={idx}
                                                                            className={`px-4 py-3 hover:bg-indigo-900/50 cursor-pointer ${subcategory === sub ? 'bg-indigo-900/30 text-indigo-300' : 'text-gray-300'}`}
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setCategory(c.name);
                                                                                setSubcategory(sub);
                                                                                setCateShow(false);
                                                                            }}
                                                                        >
                                                                            {sub}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="px-4 py-4 text-center text-gray-500">
                                                    No categories found
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-5">
                                <div className="flex flex-col gap-2">
                                    <label className="text-gray-300 font-medium flex items-center gap-2">
                                        Stock Quantity
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        className="px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-gray-700/70 border border-slate-600 rounded-xl text-gray-200 placeholder-gray-500 transition-all"
                                        onChange={inputHandle}
                                        value={state.stock}
                                        type="number"
                                        min="0"
                                        placeholder="Enter available stock"
                                        name="stock"
                                        id="stock"
                                        required
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-gray-300 font-medium flex items-center gap-2">
                                        Price (₦)
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        className="px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-gray-700/70 border border-slate-600 rounded-xl text-gray-200 placeholder-gray-500 transition-all"
                                        onChange={inputHandle}
                                        value={state.price}
                                        type="number"
                                        placeholder="Enter price"
                                        name="price"
                                        id="price"
                                        required
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-gray-300 font-medium">Discount (%)</label>
                                    <input
                                        min="0"
                                        max="100"
                                        className="px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-gray-700/70 border border-slate-600 rounded-xl text-gray-200 placeholder-gray-500 transition-all"
                                        onChange={inputHandle}
                                        value={state.discount}
                                        type="number"
                                        placeholder="Enter discount percentage"
                                        name="discount"
                                        id="discount"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-8">
                            <label className="block text-gray-300 font-medium mb-3 flex items-center gap-2">
                                Product Description
                                <span className="text-red-500">*</span>
                            </label>
                            <div className="bg-gray-700/70 border border-slate-600 rounded-xl overflow-hidden">
                                <JoditEditor
                                    ref={editor}
                                    value={content}
                                    tabIndex={1}
                                    onBlur={newContent => setContent(newContent)}
                                    onChange={newContent => { }}
                                    config={{
                                        theme: 'dark',
                                        readonly: false,
                                        toolbarAdaptive: false,
                                        toolbarButtonSize: 'medium',
                                        style: {
                                            color: '#d1d5db',
                                            background: 'transparent'
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        {/* Category-specific Specifications */}
                        {categorySpecs.length > 0 && (
                            <div className="mt-8">
                                <div className="flex justify-between items-center mb-4">
                                    <label className="block text-gray-300 font-medium flex items-center gap-2">
                                        Product Specifications
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <span className="text-sm text-indigo-400">
                                        {category}{subcategory ? ` > ${subcategory}` : ''}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {categorySpecs.map((spec, index) => (
                                        <div key={index} className="flex flex-col gap-2">
                                            <label className="text-gray-300 font-medium">{spec}</label>
                                            <input
                                                type="text"
                                                value={specifications[spec] || ''}
                                                onChange={(e) => handleSpecChange(spec, e.target.value)}
                                                placeholder={`Enter ${spec}`}
                                                className="px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-gray-700/70 border border-slate-600 rounded-xl text-gray-200 placeholder-gray-500 transition-all"
                                                required
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="mt-8">
                            <div className="flex justify-between items-center mb-4">
                                <label className="block text-gray-300 font-medium flex items-center gap-2">
                                    Product Images
                                    <span className="text-red-500">*</span>
                                </label>
                                <span className="text-sm text-gray-500">{images.length}/8 images</span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {imageShow.map((img, i) => (
                                    <div key={i} className="relative group h-40 md:h-48 rounded-xl overflow-hidden border-2 border-slate-700 hover:border-indigo-500 transition-all">
                                        <label htmlFor={i} className="block w-full h-full cursor-pointer">
                                            <img
                                                className="w-full h-full object-cover group-hover:opacity-70 transition-opacity"
                                                src={img.url}
                                                alt="Preview"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <span className="text-white text-sm font-medium">Change</span>
                                            </div>
                                        </label>
                                        <input
                                            onChange={(e) => changeImage(e.target.files[0], i)}
                                            type="file"
                                            id={i}
                                            className="hidden"
                                            accept="image/*"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(i)}
                                            className="absolute top-2 right-2 bg-gray-800/80 p-1.5 rounded-full text-red-400 shadow-md hover:bg-red-500 hover:text-white transition-colors"
                                        >
                                            <IoCloseSharp className="text-lg" />
                                        </button>
                                    </div>
                                ))}

                                {imageShow.length < 8 && (
                                    <>
                                        <label
                                            className="flex flex-col justify-center items-center h-40 md:h-48 rounded-xl border-2 border-dashed border-slate-700 bg-gray-700/30 text-gray-400 hover:border-indigo-500 hover:text-indigo-400 transition-all cursor-pointer"
                                            htmlFor="image"
                                        >
                                            <div className="p-3 rounded-full bg-indigo-900/30 text-indigo-400 mb-3">
                                                <BsUpload className="text-2xl" />
                                            </div>
                                            <span className="font-medium text-center px-2">Upload Images</span>
                                            <span className="text-xs text-gray-500 mt-1">Max 8 images</span>
                                        </label>
                                        <input
                                            multiple
                                            onChange={imageHandle}
                                            className="hidden"
                                            type="file"
                                            id="image"
                                            accept="image/*"
                                        />
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="mt-10 flex justify-center">
                            <button
                                disabled={loader}
                                className={`w-full max-w-md py-4 px-6 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center ${loader
                                        ? 'bg-indigo-800'
                                        : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 hover:shadow-xl'
                                    }`}
                            >
                                {loader ? (
                                    <PropagateLoader color="#fff" cssOverride={overrideStyle} />
                                ) : (
                                    <>
                                        <BsPlusLg className="mr-2" />
                                        Add Product
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
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
    );
};

export default AddProduct;