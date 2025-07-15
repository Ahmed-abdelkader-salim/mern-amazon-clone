import express from "express";
const router = express.Router();
import { getProducts, getProductById, 
    getProductBySlug, getCategories, addReview,
    searchProduct,
    getBrands,
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




export default router;
