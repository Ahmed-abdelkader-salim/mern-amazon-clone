import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";


export const api = createApi({
    baseQuery:fetchBaseQuery({baseUrl:process.env.REACT_APP_BASE_URL, credentials: 'include'}),
    reducerPath:"UserApi",
    tagTypes:["Products","ProductsBySlug", "User", "Cart", "Order"],
    endpoints:(build) => ({
                // ----------------------- PRODUCTS -----------------------
        getProducts:build.query({
            query:() => "api/products",
            providesTags:["Products"]
        }),
        getProductBySlug:build.query({
            query:(slug) => `api/products/slug/${slug}`,
            providesTags:["ProductsBySlug"]
        }),
        addProductReview:build.mutation({
            query:({id, reviewData}) => ({
                url:`api/products/${id}/reviews`,
                method:"POST",
                body:reviewData,
                
            }),
            invalidatesTags: (result, error, { id, slug }) => [
              { type: 'Products', productId: slug },
              { type: 'Review', productId: slug }
            ],
        }),
        getCategories: build.query({
          query: () => "api/products/categories",
          providesTags: ["Products"]
      }),
       getBrands: build.query({
          query: (category) => {
              const categoryParam = category && category !== 'all' ? `?category=${category}` : '';
              return `api/products/brands${categoryParam}`;
          },
          providesTags: ["Products"]
      }),
      searchProducts: build.query({
        query: (params) => ({
          url: 'api/products/search',
          params,
        }),
      }),
      getSuggestions: build.query({
          query: (searchQuery) => `api/products/search/suggestions?query=${encodeURIComponent(searchQuery)}`,
          providesTags: ["Products"]
      }),
          
        
        
        
        // ----------------------- AUTH -----------------------
        register:build.mutation({
            query:(data) => ({
                url:"api/auth/register",
                method:"POST",
                body:data
            }),
        }),
        verifyEmail:build.mutation({
            query:({ email, verificationCode }) => ({
                url:"api/auth/verify-email",
                method:"POST",
                body:{ email, verificationCode }
            }),
            invalidatesTags:['User']
        }),
        resendVerificationCode: build.mutation({
            query: ({ email }) => ({
              url: "api/auth/resend-verification",
              method: 'POST',
              body: { email },
            }),
        }),

        login:build.mutation({
            query:(data) => ({
                url:"api/auth/login",
                method:"POST",
                body:data
            }),
            invalidatesTags: ["User"],
        }),
        logout:build.mutation({
            query:() => ({
                url:"api/auth/logout",
                method:"POST",
            }),
            invalidatesTags: ["User"]
        }),
        forgotPassword: build.mutation({
            query: (data) => ({
                url: "api/auth/forgot-password",
                method: "POST",
                body: data,
            }),
        }),
        verifyCode: build.mutation({
            query: (data) => ({
                url: "api/auth/verify-code",
                method: "POST",
                body: data,
            }),
        }),
        resendCode:build.mutation({
            query:(data) => ({
                url:"api/auth/resend-code",
                method:"POST",
                body: data,

            }),
        }),
        resetPasswordWithToken: build.mutation({
            query: (data) => ({
                url: "api/auth/reset-password",
                method: "POST",
                body: data,
            }),
        }),
        validateResetToken: build.mutation({
            query: (data) => ({
              url: "api/auth/validate-reset-token",
              method: 'POST',
              body: data,
            }),
          }),
          getCurrentUser: build.query({
            query: () => "api/auth/me",
            providesTags: ["User"],
          }),
          UpdatedProfile: build.mutation({
            query:(data) => ({
            url:"api/auth/profile",
            method:"PUT",
            body:data,
            }),
            invalidatesTags: ['User'],
          }),

          // ----------------------- CART -----------------------

          getCart:build.query({
            query: () => "api/cart",
            providesTags:["Cart"]
          }),
          addToCart:build.mutation({
            query:(item) => ({
                url:'/api/cart/add',
                method:'POST',
                body:item,
            }),
            invalidatesTags:["Cart"],
          }),
          updateCartItem: build.mutation({
            query: ({ productId, quantity, selectedVariant }) => ({
              url: `api/cart/update/${productId}`,
              method: 'PUT',
              body: {
                quantity,
                selectedVariant: selectedVariant || ''
              },
            }),
            invalidatesTags: ["Cart"],
          }),
            removeFromCart: build.mutation({
              query: ({ productId, selectedVariant }) => ({
                url: `api/cart/remove/${productId}`,
                method: 'DELETE',
                body: {
                  selectedVariant: selectedVariant || ''
                },
              }),
              invalidatesTags: ["Cart"],
            }),
              clearCart: build.mutation({
                query: () => ({
                  url: "api/cart",
                  method: 'DELETE',
                }),
                invalidatesTags: ["Cart"],
              }),
              applyCoupon: build.mutation({
                query: (couponCode) => ({
                  url: "api/cart/coupons",
                  method: 'POST',
                  body: { couponCode },
                }),
                invalidatesTags: ["Cart"],
              }),
              getCartCount: build.query({
                query: () => "api/cart/count",
                providesTags: ["Cart"],
              }),
              mergeCart: build.mutation({
                query: (cartData) => ({
                  url: "api/cart/merge",
                  method: 'POST',
                  body: cartData,
                }),
                invalidatesTags: ["Cart"],
              }),



                   // ----------------------- ORDER -----------------------


              saveShippingAddress:build.mutation({
                query:(shippingData) => ({
                  url:'api/orders/shipping',
                  method:'POST',
                  body:shippingData
                }),
                invalidatesTags: ['Order']
              }),
              savePaymentMethod:build.mutation({
                query:(paymentMethodData) => ({
                  url:'api/orders/paymentmethod',
                  method:'POST',
                  body:paymentMethodData
                }),
                invalidatesTags:['Order']
              }),
              placeOrder:build.mutation({
                query:(placeData) => ({
                  url:"api/orders/placeorder",
                  method:'POST',
                  body:placeData
                }),
                invalidatesTags:['Order', 'Cart']

              }), 
              getPendingOrder:build.query({
                query:() => 'api/orders/pending',
                providesTags:['Order']
              }),
              getOrderById:build.query({
                query:({orderId}) => `api/orders/order/${orderId}`,
                providesTags:['Order']
              }),
              getOrder:build.query({
                query:() => 'api/orders',
                providesTags:['Order']
              }),
              updateOrderPayment: build.mutation({
                query: ({ orderId, paymentResult }) => ({
                  url: `api/orders/${orderId}/pay`,
                  method: 'PUT',
                  body: paymentResult,
                }),
                invalidatesTags:['Order']
              }),
          
              // 2. Mark Order as Delivered (admin only)
              deliverOrder: build.mutation({
                query: ({ orderId }) => ({
                  url: `api/orders/${orderId}/deliver`,
                  method: 'PUT',
                }),
                invalidatesTags:['Order']
              }),
          
              // 3. Initiate Paymob Payment (generate iframe/payment key)
              initiatePaymobPayment: build.mutation({
                query: ({ orderId, method }) => ({
                  url: `api/orders/${orderId}/paymob/initiate`,
                  method: 'POST',
                  body: { method },
                }),
                invalidatesTags:['Order']

              }),
          
              // 4. Verify Paymob/PayPal payment (server-to-server validation)
              verifyPayment: build.mutation({
                query: ({ orderId, paymentProvider }) => ({
                  url: `api/orders/${orderId}/verify`,
                  method: 'POST',
                  body: { paymentProvider }, 
                }),
                invalidatesTags: ['Order'],
              }),
          
              processPaypalPayment: build.mutation({
                query: ({ orderId }) => ({
                  url: `api/orders/${orderId}/paypal`,
                  method: 'POST',
                }),
                invalidatesTags:['Order']

              }),


            }),
});
      


export const {
    useGetProductsQuery,
    useGetCategoriesQuery,
    useGetBrandsQuery,
     useGetProductBySlugQuery,
      useSearchProductsQuery,
      useGetSuggestionsQuery,
      useAddProductReviewMutation,
       useRegisterMutation,
        useLoginMutation,
         useLogoutMutation,
         useForgotPasswordMutation,
         useResetPasswordWithTokenMutation,
         useValidateResetTokenMutation,
         useVerifyCodeMutation,
         useResendCodeMutation,
         useVerifyEmailMutation,
         useResendVerificationCodeMutation,
        useGetCurrentUserQuery,
        useUpdatedProfileMutation,



        useGetCartQuery,
        useAddToCartMutation,
        useUpdateCartItemMutation,
        useRemoveFromCartMutation,
        useClearCartMutation,
        useApplyCouponMutation,
        useGetCartCountQuery,
        useMergeCartMutation,


        useSaveShippingAddressMutation,
        useSavePaymentMethodMutation,
        usePlaceOrderMutation,
        useGetPendingOrderQuery,
        useGetOrderByIdQuery,
        useGetOrderQuery,
        useUpdateOrderPaymentMutation,
        useDeliverOrderMutation,
        useInitiatePaymobPaymentMutation,
        useVerifyPaymentMutation,
        useProcessPaypalPaymentMutation,
} = api;

