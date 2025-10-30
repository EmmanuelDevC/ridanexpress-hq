import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { BsImages, BsPlusLg, BsUpload, BsInfoCircle } from 'react-icons/bs';
import { IoCloseSharp } from 'react-icons/io5';
import { useSelector, useDispatch } from 'react-redux';
import { HiOutlineCube, HiOutlineSparkles } from 'react-icons/hi';
import { FiPackage, FiDollarSign, FiTag, FiLayers, FiBox, FiPercent } from 'react-icons/fi';
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
        stock: "",
        weight: "",
        length: "",
        width: "",
        height: ""
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
        formData.append('weight', state.weight);
        formData.append('length', state.length);
        formData.append('width', state.width);
        formData.append('height', state.height);
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
                stock: "",
                weight: "",
                length: "",
                width: "",
                height: ""
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
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Add New Product</h1>
                            <p className="text-gray-600 mt-2">Create a new product listing for your store</p>
                        </div>
                        <Link
                            to="/seller/dashboard/products"
                            className="inline-flex items-center gap-2 bg-white border border-gray-300 hover:border-gray-400 text-gray-700 font-medium px-4 py-2.5 rounded-lg transition-colors"
                        >
                            <HiOutlineCube className="text-lg" />
                            View Products
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-center space-x-4 mb-4">
                        {['Basic Info', 'Pricing', 'Media', 'Review'].map((step, index) => (
                            <div key={step} className="flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                    index === 0 
                                        ? 'bg-green-500 text-white' 
                                        : 'bg-gray-200 text-gray-600'
                                }`}>
                                    {index + 1}
                                </div>
                                <span className={`ml-2 text-sm font-medium ${
                                    index === 0 ? 'text-gray-900' : 'text-gray-500'
                                }`}>
                                    {step}
                                </span>
                                {index < 3 && (
                                    <div className="w-12 h-0.5 bg-gray-200 mx-4"></div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
                                <HiOutlineSparkles className="text-white text-lg" />
                            </div>
                            Product Information
                        </h2>
                        <p className="text-gray-600 text-sm mt-2">
                            Fill in all required fields to create your product listing
                        </p>
                    </div>

                    <form onSubmit={add} className="p-6 lg:p-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                            {/* Left Column - Basic Information */}
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <FiPackage className="text-gray-700" />
                                        Basic Information
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Product Name *
                                            </label>
                                            <input
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                                                onChange={inputHandle}
                                                value={state.name}
                                                type="text"
                                                placeholder="Enter product name"
                                                name="name"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Brand Name *
                                            </label>
                                            <input
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                                                onChange={inputHandle}
                                                value={state.brand}
                                                type="text"
                                                placeholder="Enter brand name"
                                                name="brand"
                                                required
                                            />
                                        </div>

                                        <div className="relative">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Category & Subcategory *
                                            </label>
                                            <div
                                                onClick={() => setCateShow(!cateShow)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none cursor-pointer flex justify-between items-center hover:border-gray-400 transition-colors"
                                            >
                                                <span className={category ? 'text-gray-900' : 'text-gray-500'}>
                                                    {category
                                                        ? (subcategory ? `${category} > ${subcategory}` : category)
                                                        : "Select category"}
                                                </span>
                                                <svg
                                                    className={`w-4 h-4 text-gray-400 transition-transform ${cateShow ? 'rotate-180' : ''}`}
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                                </svg>
                                            </div>
                                            
                                            {cateShow && (
                                                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10 overflow-hidden">
                                                    <div className="p-3 border-b border-gray-200">
                                                        <input
                                                            value={searchValue}
                                                            onChange={categorySearch}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 outline-none"
                                                            type="text"
                                                            placeholder="Search categories..."
                                                            autoFocus
                                                        />
                                                    </div>
                                                    <div className="max-h-60 overflow-y-auto">
                                                        {allCategory.length > 0 ? (
                                                            allCategory.map((c, i) => (
                                                                <div key={i} className="relative">
                                                                    <div
                                                                        className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors flex justify-between items-center ${
                                                                            category === c.name ? 'bg-green-50 text-green-700' : 'text-gray-700'
                                                                        }`}
                                                                        onClick={() => {
                                                                            setCategory(c.name);
                                                                            setSubcategory('');
                                                                            if (c.subcategories?.length === 0) {
                                                                                setCateShow(false);
                                                                            }
                                                                        }}
                                                                        onMouseEnter={() => setHoveredCategory(c._id)}
                                                                        onMouseLeave={() => setHoveredCategory(null)}
                                                                    >
                                                                        <div className="flex items-center gap-3">
                                                                            <FiLayers className="text-gray-400" />
                                                                            {c.name}
                                                                        </div>
                                                                        {c.subcategories?.length > 0 && (
                                                                            <svg
                                                                                className="w-4 h-4 text-gray-400"
                                                                                fill="none"
                                                                                stroke="currentColor"
                                                                                viewBox="0 0 24 24"
                                                                            >
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                                                                            </svg>
                                                                        )}
                                                                    </div>

                                                                    {hoveredCategory === c._id && c.subcategories?.length > 0 && (
                                                                        <div className="absolute left-full top-0 ml-1 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-20">
                                                                            <div className="max-h-60 overflow-y-auto py-2">
                                                                                {c.subcategories.map((sub, idx) => (
                                                                                    <div
                                                                                        key={idx}
                                                                                        className={`px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm ${
                                                                                            subcategory === sub ? 'bg-green-50 text-green-700' : 'text-gray-700'
                                                                                        }`}
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
                                                            <div className="px-4 py-4 text-center text-gray-500 text-sm">
                                                                No categories found
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Stock Quantity *
                                            </label>
                                            <input
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                                                onChange={inputHandle}
                                                value={state.stock}
                                                type="number"
                                                min="0"
                                                placeholder="Enter stock quantity"
                                                name="stock"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Dimensions & Weight */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        {/* <FiRuler className="text-gray-700" /> */}
                                        Dimensions & Weight
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Weight (kg) *
                                            </label>
                                            <input
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                                                onChange={inputHandle}
                                                value={state.weight}
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                placeholder="Example: 2.4"
                                                name="weight"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Dimensions (cm) *
                                            </label>
                                            <div className="grid grid-cols-3 gap-3">
                                                <div>
                                                    <input
                                                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-center"
                                                        onChange={inputHandle}
                                                        value={state.length}
                                                        type="number"
                                                        min="0"
                                                        placeholder="Length"
                                                        name="length"
                                                        required
                                                    />
                                                    <p className="text-xs text-gray-500 text-center mt-1">Length</p>
                                                </div>
                                                <div>
                                                    <input
                                                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-center"
                                                        onChange={inputHandle}
                                                        value={state.width}
                                                        type="number"
                                                        min="0"
                                                        placeholder="Width"
                                                        name="width"
                                                        required
                                                    />
                                                    <p className="text-xs text-gray-500 text-center mt-1">Width</p>
                                                </div>
                                                <div>
                                                    <input
                                                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-center"
                                                        onChange={inputHandle}
                                                        value={state.height}
                                                        type="number"
                                                        min="0"
                                                        placeholder="Height"
                                                        name="height"
                                                        required
                                                    />
                                                    <p className="text-xs text-gray-500 text-center mt-1">Height</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Pricing & Media */}
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <FiDollarSign className="text-gray-700" />
                                        Pricing Information
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Price (₦) *
                                            </label>
                                            <input
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                                                onChange={inputHandle}
                                                value={state.price}
                                                type="number"
                                                placeholder="Enter price in Naira"
                                                name="price"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Discount (%)
                                            </label>
                                            <input
                                                min="0"
                                                max="100"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                                                onChange={inputHandle}
                                                value={state.discount}
                                                type="number"
                                                placeholder="Enter discount percentage"
                                                name="discount"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Product Description */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <BsInfoCircle className="text-gray-700" />
                                        Product Description *
                                    </h3>
                                    <div className="border border-gray-300 rounded-lg overflow-hidden">
                                        <JoditEditor
                                            ref={editor}
                                            value={content}
                                            tabIndex={1}
                                            onBlur={newContent => setContent(newContent)}
                                            config={{
                                                theme: 'light',
                                                readonly: false,
                                                toolbarAdaptive: false,
                                                style: {
                                                    minHeight: '200px'
                                                },
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Category-specific Specifications */}
                        {categorySpecs.length > 0 && (
                            <div className="mt-8 pt-8 border-t border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <FiTag className="text-gray-700" />
                                    Product Specifications
                                    <span className="text-sm font-normal text-gray-500 ml-2">
                                        ({category}{subcategory ? ` > ${subcategory}` : ''})
                                    </span>
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {categorySpecs.map((spec, index) => (
                                        <div key={index}>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                {spec} *
                                            </label>
                                            <input
                                                type="text"
                                                value={specifications[spec] || ''}
                                                onChange={(e) => handleSpecChange(spec, e.target.value)}
                                                placeholder={`Enter ${spec.toLowerCase()}`}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                                                required
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Image Upload */}
                        <div className="mt-8 pt-8 border-t border-gray-200">
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <BsImages className="text-gray-700" />
                                        Product Images *
                                    </h3>
                                    <p className="text-gray-600 text-sm mt-1">
                                        Upload up to 8 images of your product
                                    </p>
                                </div>
                                <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                                    {images.length}/8 images selected
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {imageShow.map((img, i) => (
                                    <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border-2 border-gray-300 hover:border-green-500 transition-all shadow-sm">
                                        <label htmlFor={i} className="block w-full h-full cursor-pointer">
                                            <img
                                                className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                                                src={img.url}
                                                alt="Preview"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <span className="text-white text-sm font-medium">Change Image</span>
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
                                            className="absolute top-2 right-2 bg-white/90 hover:bg-red-500 text-gray-600 hover:text-white p-1.5 rounded-full shadow-md transition-colors"
                                        >
                                            <IoCloseSharp className="text-lg" />
                                        </button>
                                    </div>
                                ))}

                                {imageShow.length < 8 && (
                                    <>
                                        <label
                                            className="flex flex-col items-center justify-center aspect-square rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:border-green-500 hover:bg-green-50 transition-all cursor-pointer group"
                                            htmlFor="image"
                                        >
                                            <div className="p-3 rounded-full bg-green-100 text-green-600 mb-3 group-hover:bg-green-200 transition-colors">
                                                <BsUpload className="text-xl" />
                                            </div>
                                            <span className="font-medium text-gray-700 text-sm text-center px-2">Upload Images</span>
                                            <span className="text-xs text-gray-500 mt-1">PNG, JPG, JPEG</span>
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

                        {/* Submit Button */}
                        <div className="mt-8 pt-8 border-t border-gray-200">
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                <div className="text-sm text-gray-600">
                                    All fields marked with * are required
                                </div>
                                <button
                                    disabled={loader}
                                    className={`w-full sm:w-auto min-w-[200px] py-4 px-8 rounded-xl font-semibold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
                                        loader
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:shadow-xl transform hover:-translate-y-0.5'
                                    }`}
                                >
                                    {loader ? (
                                        <PropagateLoader color="#fff" cssOverride={overrideStyle} />
                                    ) : (
                                        <>
                                            <BsPlusLg className="text-lg" />
                                            Add Product
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddProduct;