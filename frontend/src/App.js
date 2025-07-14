import {BrowserRouter as Router, Routes, Route} from "react-router-dom"
import HomePage from "./pages/HomePage";
import ProductDetailPage from "./pages/ProductDetailPage";
import Header from "./components/Header";
import SearchResults from "./pages/SearchResults";
import Footer from "./components/Footer";
import BacktoTop from "./components/BacktoTop";
import NotFound from "./pages/NotFound";
import Cart from "./pages/Cart";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import VerifyCode from "./pages/auth/VerifyCode";
import PlaceOrder from "./pages/PlaceOrder";
import ShippingAddress from "./pages/ShippingAddress";
import PaymentMethod from "./pages/PaymentMethod";
import OrderSummary from "./pages/OrderSummary";
import OrderHistory from "./pages/OrderHistory";
import Profile from "./pages/Profile";
import Map from "./pages/Map";
import ProtectedRoute from "./routes/ProtectedRoute";
import {Toaster} from "react-hot-toast";
import VerifyEmail from "./pages/auth/VerifyEmail";
import AuthRedirected from "./routes/AuthRedirected";

const App = () => {
  return (
    <Router >
      <div className="app min-w-[1000px] max-w-[1500px] m-auto">
      {/* header */}
      <Header/>
        <Routes>
          {/* Public Routes */}
          <Route exact path="/" element={<HomePage/>}/>
          <Route path="/search" element={<SearchResults/>}/>
          <Route path="/product/:slug" element={<ProductDetailPage/>}/>
          <Route path="/cart" element={<Cart/>}/>

          {/* Auth Routes */}
          <Route path="/login" element={<AuthRedirected> <Login/> </AuthRedirected> }/>
          <Route path="/register" element={<Register/>}/>
          <Route path="/verify-email" element={<VerifyEmail/>}/>
          <Route path="/forgot-password" element={<ForgotPassword/>}/>
          <Route path="/verify-code" element={<VerifyCode />} />
          <Route path="/reset-password/:token" element={<ResetPassword/>}/>

            {/* Protected Routes */}
          <Route path="/order/:id" element={ <ProtectedRoute> <OrderSummary/> </ProtectedRoute> }/>
          <Route path="/order-history" element={<ProtectedRoute> <OrderHistory/> </ProtectedRoute>}/>
          <Route path="/profile" element={<ProtectedRoute> <Profile/> </ProtectedRoute>}/>
          <Route path="/shipping" element={<ProtectedRoute> <ShippingAddress/> </ProtectedRoute>}/>
          <Route path="/map" element={ <ProtectedRoute> <Map/> </ProtectedRoute> }/>
          <Route path="/payment" element={<ProtectedRoute> <PaymentMethod/> </ProtectedRoute>}/>
          <Route path="/place-order" element={<ProtectedRoute> <PlaceOrder/> </ProtectedRoute>}/>


          {/* Admin Routes */}
        

          {/* not found */}
          <Route path="*" element={<NotFound/>}/>

        </Routes>
         {/* Back to top */}
         <BacktoTop/>

      {/* Footer */}
      <Footer/>
         {/* Toast Container - Add this at the end of your App */}
         <Toaster
          position="top-right"
      
        />
      </div>
    </Router>
  );
}

export default App;
