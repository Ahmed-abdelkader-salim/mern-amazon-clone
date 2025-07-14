import express from "express";
const router = express.Router();
import { getProducts, createProduct, updateProduct, deleteProduct, getProductById, 
    getProductBySlug, getCategories, addReview,
    searchProduct,
    getBrands,
    getAllProducts,
    getSearchSuggestions
 } from "../controllers/productController.js";
import { isAuth } from "../middleware/auth.js";
import { isAdmin } from "../middleware/isAdmin.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {productValidatorSchema} from "../validators/productValidator.js"

// ================================================= //
          //         Public Routes     //
// ================================================= //

// get all products
router.get("/", getProducts);
// get product by id
router.get("/get/:id", getProductById);

// get product by slug
router.get("/slug/:slug", getProductBySlug);

// Search products
router.get('/search', searchProduct);

// Get search suggestions
router.get('/search/suggestions', getSearchSuggestions);

// Get all categories
router.get('/categories', getCategories);

// Get brands (optionally filtered by category)
router.get('/brands', getBrands);

// ================================================= //
          //         User auth route     //
// ================================================= //
// add review
router.post("/:id/reviews",  isAuth, addReview);




// ================================================= //
          //         Admin Routes     //
// ================================================= //

// get product with   pagination
router.get("/admin", isAuth, isAdmin, getAllProducts)

// create new product
router.post("/admin/add", isAuth, isAdmin, validateRequest(productValidatorSchema), createProduct);

// update product
router.put('/admin/update/:id', isAuth, isAdmin, validateRequest(productValidatorSchema), updateProduct);


// delete product
router.delete('/admin/:id', isAuth, isAdmin, deleteProduct)


export default router;
