import express from "express"
import { addCoupon, addProduct, addSubCategory, addToCart, 
    createCategory, decreaseQuantity, deleteCategory, deleteCoupon, deleteProduct, deleteSubCategory, fetchCategories, 
    getAllProducts, 
    getCategoryProducts, getCoupons, getProduct, getSinlgeCoupon, getStoreDetails, increaseQuantity, 
    storeDetails, 
    storeLocation, 
    toggleWishlist, updateCoupon, updateProduct,getProductsWithNewTags, getDealOfTheDayProducts, getTrendingProducts } from "../Controllers/storeController.js"
import authMiddleware from "../Middlewares/authMiddleware.js"


const router = express.Router()
router.put('/:id', authMiddleware, storeDetails)
router.get('/details', authMiddleware, getStoreDetails)
router.put('/location/:id', authMiddleware, storeLocation)
router.post("/category",authMiddleware, createCategory)
router.post("/subcategory",authMiddleware, addSubCategory)
router.get("/get-categories",authMiddleware, fetchCategories)
router.delete("/subcategory/delete/:mainId/:subId", authMiddleware, deleteSubCategory)
router.delete("/category/delete/:id", authMiddleware, deleteCategory)

router.post("/product",authMiddleware, addProduct)
router.delete("/product/delete/:id", authMiddleware, deleteProduct)
router.put("/update-product/:productId", updateProduct)

router.get("/getcategory-product/:category/:subCategory", getCategoryProducts)

router.get("/get-product/:productId",authMiddleware, getProduct)
router.get("/get-allproducts", getAllProducts)
router.get("/get-newproduct", getProductsWithNewTags)
router.get("/get-dealproduct", getDealOfTheDayProducts)
router.get("/get-trendingproduct", getTrendingProducts)

router.post("/add-to-cart", addToCart)

router.post("/increase-quantity/:productId/:userId", increaseQuantity)
router.post("/decrease-quantity/:productId/:userId", decreaseQuantity)

router.post("/wishlist/:productId/:userId", toggleWishlist)
router.post('/coupon/add',authMiddleware, addCoupon)
router.get('/coupon/get',authMiddleware, getCoupons)
router.get('/coupon/get/:id',authMiddleware, getSinlgeCoupon)
router.put('/coupon/update/:id',authMiddleware, updateCoupon)
router.delete('/coupon/delete/:id',authMiddleware, deleteCoupon)

export default router