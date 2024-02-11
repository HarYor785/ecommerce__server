import Product from "../Models/ProductModel.js"
import Accounts from "../Models/accountModel.js"
import Cart from "../Models/cartModel.js"
import Category from "../Models/categoryModel.js"
import Coupon from "../Models/couponModel.js"
import Store from "../Models/storeModel.js"
import Wishlist from "../Models/wishlistModel.js"
import { v4 as uuidv4 } from "uuid"

export const storeDetails = async (req, res)=>{
    try {
        const {userId} = req.body.user
        const {id} = req.params
        const {storeName,storeDesc,storeEmail,
            storeMobile,currency,timeZone,weight,dimensionUnit
        } = req.body
        const user = await Accounts.findById(userId)
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Authentification failed"
            })
        }

        const saveStore = await Store.findByIdAndUpdate({_id: id},{
            name : storeName,
            description : storeDesc || "",
            email : storeEmail,
            mobile : storeMobile,
            currency : currency,
            timeZone : timeZone,
            dimensionUnit : dimensionUnit,
            weight : weight,
        },{new: true})

        if(saveStore){
            res.status(201).send({
                success:true,
                message: "Store details saved"
            })
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "An error occurred while processing your request."
        })
    }
}

export const getStoreDetails = async (req, res)=>{
    try{
        const {userId} = req.body.user
        const user = await Accounts.findById(userId)
        if(!user){
            return res.status(404).json({
                success: false,
                message: "Invalid credentials."
            })
        }
        const store = await Store.find()
        res.status(201).json({
            success: true,
            data: store,
        })
    }catch(error){
        console.log(error)
        res.status(500).json({
            success:false,
            message:"An error occurred while processing your request."
        })
    }
}

export const storeLocation = async (req, res)=>{
    try {
        const {userId} = req.body.user
        const {id} = req.params
        const {
            locationName, country, address,apartment,
            phone,city,state,zipCode
        } = req.body
        const user = await Accounts.findById(userId)
        if(!user){
            return res.status(500).json({
                success: false,
                message: "Authorization failed"
            })
        }
        const store = await Store.findById(id)
        if(!store){
            return res.status(404).json({
                success: false,
                message: "Store not found"
            })
        }

        store.address = {
            name: locationName,
            country,
            address,
            apartment,
            phone,
            city,
            state,
            zipCode
        }

        await store.save()

        res.status(200).json({
            success: true,
            message: "Location saved"
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "An error occurred while processing your request."
        })
    }
}

export const createCategory = async (req, res)=>{
    try {
        const {userId} = req.body.user
        const {name, slug, subCategoryTags, description, attachment} = req.body

        const user = await Accounts.findById(userId)
        if(!user){
            return res.status(404).json({
                success: false,
                message: 'Authorization failed'
            })
        }
        const existCategory = await Category.findOne({name})

        if(existCategory){
            return res.status(400).json({
                success: false,
                message: "Category already exist"
            })
        }

        const subcategoryArray = Array.isArray(subCategoryTags)
        ? subCategoryTags?.map((sub)=> ({name: sub}))
        : [{name: subCategoryTags}]

        const newCategory = new Category({
            name,
            slug,
            subCategory: subcategoryArray,
            description,
            attachment: attachment ?? ''
        })

        const savedCategory = await newCategory.save()

        res.status(201).json({
            success: true,
            message: "Category created successfully",
            data: savedCategory
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

export const addSubCategory = async(req, res)=>{
    try {
        const {userId} = req.body.user
        const {mainCategory, name, slug, description} = req.body
        const user = await Accounts.findById(userId)
        if(!user){
            return res.status(404).json({
                success: false,
                message: 'Authorization failed'
            })
        }
        const foundCategory = await Category.findOne({name: mainCategory})
        
        if(!foundCategory){
            return res.status(400).json({
                success: false,
                message: "Category not found"
            })
        }

        const existSubCategory = foundCategory.subCategory.find(
            (som) => som.name === name
        )
        
        if(existSubCategory){
            return res.status(400).json({
                success: false,
                message: "Sub Category already exist"
            })
        }

        const newSubCategory = {
            name,
            slug,
            description
        }

        foundCategory.subCategory.push(newSubCategory)
        
        const savedCategory = await foundCategory.save()
        
        res.status(201).json({
            success: true,
            message: "Sub Category created successfully",
            data: savedCategory
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

export const fetchCategories = async (req, res)=>{
    try {
        const {userId} = req.body.user
        const user = await Accounts.findById(userId)
        if(!user){
            return res.status(404).json({
                success: false,
                message: 'Authorization failed'
            })
        }

        const categories = await Category.find()

        const categoryWithTotalProduct = await Promise.all(categories.map(async(category)=>{
            const totalProducts = await Product.countDocuments({category: category._id})
            const subCategoryProducts = await Promise.all(category.subCategory.map(async(sub)=>{
                const totalSubCategoryProduct = await Product.countDocuments({subCategory: sub._id})
                return {...sub.toObject(), totalProducts: totalSubCategoryProduct}
            }))
            return {...category.toObject(), subCategory: subCategoryProducts, totalProducts}
        }))

        res.status(200).json({
            success: true,
            message: "Categories fetched successfully",
            data: categoryWithTotalProduct
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

export const deleteSubCategory = async (req, res)=>{
    try {
        const {mainId, subId} = req.params
        const {userId}= req.body.user
        //Check if the user is authorized to perform this action
        const user = await Accounts.findById(userId)
        if (!user) {
            return res.status(401).json({
                success:false,
                message:"Authorization failed"
            })
        }
        const category = await Category.findOne({_id: mainId})
        if(!category){
            return res.status(404).json({
                success: false,
                message: 'No such category found'
            })
        }
        let index = category.subCategory.findIndex((sub)=>sub._id.toString() === subId.toString());
        if(index !== -1){
            category.subCategory.splice(index, 1)
        }
        
        
        await category.save()

        res.status(200).json({
            success: true,
            message: 'Sub category deleted'
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

export const deleteCategory = async (req,res)=>{
    try {
        const {id} = req.params
        const {userId}= req.body.user
        const user = await Accounts.findById(userId)
        if (!user) {
            return res.status(401).json({
                success:false,
                message:"Authorization failed"
            })
        }
        const category = await Category.findByIdAndDelete(id)

        res.status(200).json({
            success:true,
            message:'Category deleted successfully.'
        })
        
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

export const addProduct = async (req, res)=>{
    try {
        const {
            name, 
            price, 
            slug,
            shortDescription,
            description,
            discount,
            category,
            subCategory, 
            collection,
            imageUrl,
            stock,
            tags,
            shippingFee,
            status
        } = req.body

        const foundCategory = await Category.findOne({name: category})

        if(!foundCategory){
            return res.status(400).json({
                success: false,
                message: "Category not found"
            })
        }

        const foundSubCategory = foundCategory.subCategory.find(
            (som) => som.name === subCategory
        )
        
        if(!foundSubCategory){
            return res.status(400).json({
                success: false,
                message: "Sub Category not found"
            })
        }

        const existProduct = await Product.findOne({name})
        
        if(existProduct){
            return res.status(400).json({
                success: false,
                message: "Product already exist"
            })
        }

        const newProduct = new Product({
            name,
            price,
            slug,
            shortDescription,
            description,
            discountedPrice: discount,
            category: foundCategory._id,
            subCategory: foundSubCategory._id,
            collections:collection,
            images: imageUrl,
            stock,
            tags,
            shippingFee,
            status
        })

        await newProduct.save()

        res.status(201).json({
            success: true,
            message: "Product added successfully",
            product: newProduct
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
}

export const updateProduct = async (req, res)=>{
    try {
        const {
            name, 
            price, 
            slug,
            shortDescription,
            description,
            discount,
            category,
            subCategory, 
            collection,
            allImg,
            stock,
            tags,
            shippingFee,
            status
        } = req.body
        const {productId} = req.params
        const foundProduct = await Product.findOne({_id: productId})
        
        if(!foundProduct){
            return res.status(400).json({
                success: false,
                message: "Product not found"
            })
        }
        
        const foundCategory = await Category.findOne({name: category})
        
        if(!foundCategory){
            return res.status(400).json({
                success: false,
                message: "Category not found"
            })
        }

        const foundSubCategory = foundCategory.subCategory.find(
            (som) => som.name === subCategory
        )
        
        if(!foundSubCategory){
            return res.status(400).json({
                success: false,
                message: "Sub Category not found"
            })
        }

        const updateProduct = await Product.findByIdAndUpdate({_id: productId},{
            name,
            price,
            slug,
            shortDescription,
            description,
            discountedPrice: discount,
            category: foundCategory._id,
            subCategory: foundSubCategory._id,
            collections: collection,
            images: allImg,
            stock,
            tags,
            shippingFee,
            status
        },{
            new: true
        })
        
        res.status(200).json({
            success: true,
            message: "Product updated successfully",
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const deleteProduct = async (req, res)=>{
    try {
        const {id} = req.params
        const {userId}= req.body.user
        const user = await Accounts.findById(userId)
        if (!user) {
            return res.status(401).json({
                success:false,
                message:"Authorization failed"
            })
        }

        const product = await Product.findByIdAndDelete(id)

        res.status(200).json({
            success: true,
            message: 'Product deleted successfully'
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

export const getCategoryProducts = async (req, res)=>{
    try {
        const {category, subCategory} = req.params
        const getCategory = await Category.find({name: category})
        if(!getCategory){
            return res.status(400).json({
                success: false,
                message: "Category not found"
            })
        }
        const getSubCategory = getCategory[0].subCategory.find(
            (som) => som.name === subCategory
        )
        
        if(!getSubCategory){
            return res.status(400).json({
                success: false,
                message: "Sub Category not found"
            })
        }
        const products = await Product.find({
            category: getCategory[0]._id,
            subCategory: getSubCategory._id
        })
        res.status(200).json({
            success: true,
            message: "Products fetched successfully",
            products
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const getAllProducts = async (req, res)=>{
    try {
        // const {userId} = req.body.user
        // const user = await Accounts.findById(userId)
        // if(!user){
        //     return res.status(401).json({
        //         success: false,
        //         message:"Authorization failed"
        //     })
        // }

        const foundProduct = await Product.find().populate({
            path:'category',
        })

        const flattenedRows = foundProduct.reduce((acc, product)=>{

            const matchingSubCategory = product.category.subCategory.find((item)=>{
                return item._id.toString() === product.subCategory.toString()
            })
        
            const newRow = {
                _id: product._id,
                images: product.images[0],
                name: product.name,
                price: `$${product.price}`,
                description: product.description,
                shortDescription: product.shortDescription,
                discount: product.discountedPrice,
                stock: product.stock,
                subCategory: matchingSubCategory ? matchingSubCategory.name : '',
                status: product.status,
                date: product.createdAt
            }

            acc.push(newRow)

            return acc
        }, [])
        
        res.status(200).json({
            success: true,
            message: "Product fetched successfully",
            data: flattenedRows
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const getProductsWithNewTags = async (req, res) => {
    try {
        const products = await Product.find({
            tags: { $in: ['New products', 'New arrivals'] }
        });
    
        if (!products || products.length === 0) {
            return res.status(404).json({ message: 'No products found with new tags' });
        }
  
        res.status(200).json({
            success: true,
            message: "Products fetched successfully",
            data: products
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
};

export const getDealOfTheDayProducts = async (req, res) => {
    try {
        const products = await Product.find({ tags: 'Deal of the day' });
  
        if (!products || products.length === 0) {
            return res.status(404).json({ message: 'No products found for deal of the day' });
        }
  
        res.status(200).json({
            success: true,
            message: "Products fetched successfully",
            data: products
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
};

export const getTrendingProducts = async (req, res) => {
    try {
        const trendingProducts = await Product.find({ tags: 'Trending' });
  
        if (!trendingProducts || trendingProducts.length === 0) {
            return res.status(404).json({ message: 'No trending products found' });
        }
  
        res.status(200).json({
            success: true,
            message: "Products fetched successfully",
            data: trendingProducts
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
  };

export const getProduct = async (req, res)=>{
    try {
        const {productId} = req.params
        const {userId} = req.body.user
        const user = await Accounts.findById(userId)
        if(!user){
            return res.status(401).json({
                success: false,
                message:"Authorization failed"
            })
        }

        const product = await Product.findOne({_id: productId}).populate({
            path: 'category'
        })

        if(!product){
            return res.status(400).json({
                success: false,
                message: "Product not found"
            })
        }

            const matchingSubCategory = product.category.subCategory.find((item)=>{
                return item._id.toString() === product.subCategory.toString()
            })

            const newRows = {
                _id: product._id,
                name: product.name,
                slug: product.slug,
                description: product.description,
                shortDescription: product.shortDescription,
                price: product.price,
                discount: product.discountedPrice,
                stock: product.stock,
                images: product.images,
                collection: product.collections,
                tags: product.tags,
                shippingFee: product.shippingFee,
                status: product.status,
                subCategory: matchingSubCategory ? matchingSubCategory.name : ''
            }

        
        res.status(200).json({
            success: true,
            message: "Product fetched successfully",
            data: newRows
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

export const addToCart = async (req, res)=>{
    try {
        const { productId, quantity, userId } = req.body
        const product = await Product.findById(productId)
        
        if(!product){
            return res.status(400).json({
                success: false,
                message: "Product not found"
            })
        }

        const userExist = await Accounts.find({_id:userId})
        
        if(!userExist){
            return res.status(400).json({
                success: false,
                message: "User not found"
            })
        }

        let userCart = await Cart.findOne({user: userId})

        if(!userCart){
            userCart = new Cart({user: userId, products: []})
        }
        
        const existingCart = userCart.products.findIndex(
            (item)=> item.product.toString() === productId.toString()
        )

        if(existingCart !== -1){
            userCart.products[existingCart].quantity += quantity
        }else{
            userCart.products.push({product: productId, quantity})
        }
        
        const totalAmount = userCart.products.reduce((total, item)=>{
            const producetPrice = parseFloat(product.price)
            return total + producetPrice * item.quantity 
        }, 0)

        userCart.totalAmount = parseFloat(totalAmount.toFixed(2))

        await userCart.save()

        res.status(200).json({
            success: true,
            message: "Product added to cart successfully",
            userCart
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const increaseQuantity = async (req, res)=>{
    try {
        const {productId, userId} = req.params
        const userCart = await Cart.findOne({user: userId})
        const product = await Product.findById(productId)
        
        if(!userCart){
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            })
        }

        const productIndex = userCart.products.findIndex(
            (som)=> som.product.toString() === productId
        )
        if(productIndex === -1){
            return res.status(404).json({
                success: false,
                message: "Product not found in cart"
            })
        }
        userCart.products[productIndex].quantity += 1

        const totalAmount = userCart.products.reduce((total, item)=>{
            const producetPrice = parseFloat(product.price)
            return total + producetPrice * item.quantity
        }, 0)
        userCart.totalAmount = parseFloat(totalAmount.toFixed(2))
        await userCart.save()
        res.status(200).json({
            success: true,
            message: "Product quantity increased successfully",
            userCart
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const decreaseQuantity = async (req, res)=>{
    try {
        const {productId, userId} = req.params
        const userCart = await Cart.findOne({user: userId})
        const product = await Product.findById(productId)
        
        if(!userCart){
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            })
        }

        const productIndex = userCart.products.findIndex(
            (som)=> som.product.toString() === productId
        )
        if(productIndex === -1){
            return res.status(404).json({
                success: false,
                message: "Product not found in cart"
            })
        }
        userCart.products[productIndex].quantity = Math.max(
            userCart.products[productIndex].quantity - 1, 1
        )

        const totalAmount = userCart.products.reduce((total, item)=>{
            const producetPrice = parseFloat(product.price)
            return total + producetPrice * item.quantity
        }, 0)
        userCart.totalAmount = parseFloat(totalAmount.toFixed(2))
        await userCart.save()
        res.status(200).json({
            success: true,
            message: "Product quantity increased successfully",
            userCart
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const toggleWishlist = async (req, res)=>{
    try {
        const {userId, productId} = req.params
        let userWishlist = await Wishlist.findOne({user: userId})
        
        if(!userWishlist){
            userWishlist = new Wishlist({user: userId, products: []})
        }
        const productIndex = userWishlist.products.findIndex(
            (som)=> som.product.toString() === productId
        )
        if(productIndex === -1){
            userWishlist.products.push({product: productId})
        }else{
            userWishlist.products.splice(productIndex, 1)
        }
        await userWishlist.save()
        
        res.status(200).json({
            success: true,
            message: "Wishlist updated successfully",
            userWishlist
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// PENDING
export const order = async (req, res)=>{
    try {
        
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const addCoupon = async (req, res)=>{
    try {
        const {userId} = req.body.user
        const {
            code,
            type,
            discount,
            limit,
            registered,
            status,
            startDate,
            endDate
        } = req.body
        const user = await Accounts.findById(userId)
        if(!user){
            return res.status(401).json({
                success: false,
                message:"Authorization failed"
            })
        }

        // Check Limit for the number of coupons
        if(limit > 500){
            return res.status(400).json({
                success: false,
                message: "Coupon limit exceeds the maximum allowed limit (500)"
            })
        }

        const newCoupon = {
            code,type,discount,limit,registered,status,startDate,endDate
        }

        const coupon = new Coupon({
            ...newCoupon,
        })

        await coupon.save()

        res.status(200).json({
            success: true,
            message: "Coupon added successfully"
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

export const getCoupons = async(req, res)=>{
    try {
        const {userId} = req.body.user
        const user = await Accounts.findById(userId)
        if(!user){
            return res.status(401).json({
                success: false,
                message:"Authorization failed"
            })
        }

        const coupons = await Coupon.find().sort({_id: -1})

        res.status(200).json({
            success: true,
            data: coupons
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

export const getSinlgeCoupon = async(req, res)=>{
    try {
        const {id} = req.params
        const {userId} = req.body.user
        const user = await Accounts.findById(userId)
        if(!user){
            return res.status(401).json({
                success: false,
                message:"Authorization failed"
            })
        }

        const coupons = await Coupon.findOne({_id: id})
        if (!coupons) {
            return res.status(404).json({
                success:false,
                message: 'No coupon found'
            })
        }

        res.status(200).json({
            success: true,
            data: coupons
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

export const updateCoupon = async (req, res)=>{
    try {
        const {id} = req.params
        const {userId} = req.body.user
        const {
            code,
            type,
            discount,
            limit,
            registered,
            status,
            startDate,
            endDate
        } = req.body
        const user = await Accounts.findById(userId)
        if(!user){
            return res.status(401).json({
                success: false,
                message:"Authorization failed"
            })
        }

        const findCoupon = await Coupon.findById(id)
        if(!findCoupon){
            return res.status(404).json({
                success:false,
                message:'No coupon found'
            })
        }

        const updateCoupon = await Coupon.findByIdAndUpdate({_id:id},{
            code,
            type,
            discount,
            limit,
            registered,
            status,
            startDate,
            endDate
        },{new: true})

        res.status(200).json({
            success: true,
            message: "Coupon updated successfully",
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

export const deleteCoupon = async (req, res)=>{
    try{
        const {id} = req.params
        const {userId} = req.body.user

        const user = await Accounts.findById(userId)
        if(!user){
            return res.status(401).json({
                success: false,
                message:"Authorization failed"
            })
        }

        const coupon = await Coupon.findByIdAndDelete(id)
        if(!coupon){
            return res.status(404).json({
                success:false,
                message:"No such coupon found."
            })
        }

        res.status(200).json({
            success:true,
            message: 'Coupon deleted succefully'
        })
    }catch(error){
        console.log(error)
        res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}