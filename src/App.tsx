import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { GeneralContentProvider } from '@/contexts/GeneralContentContext';
import { CheckoutProvider } from '@/contexts/CheckoutContext';
import { Toaster } from '@/components/ui/toaster';
// Main App Component

// Layouts
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

// Scroll to top component
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// LandingPage Pages
import { Home } from '@/pages/LandingPage/Home';
import { Catalog } from '@/pages/LandingPage/Catalogue/Catalog';
import Armada from '@/pages/LandingPage/Armada/Armada';
import { Services } from '@/pages/LandingPage/Services';
import { Team } from '@/pages/LandingPage/Team';
import { Contact } from '@/pages/LandingPage/Contact';
import { CatalogDetail } from '@/pages/LandingPage/Catalogue/CatalogDetail';
import { ArmadaDetail } from '@/pages/LandingPage/Armada/ArmadaDetail';
import { CatalogCheckout } from '@/pages/LandingPage/Orders/CatalogCheckout';
import { ArmadaCheckout } from '@/pages/LandingPage/Orders/ArmadaCheckout';
import { ItineraryRequest } from '@/pages/LandingPage/Orders/ItineraryRequest';
import { Payment } from '@/pages/LandingPage/Orders/Payment';
import { PurchaseArmada } from '@/pages/LandingPage/Orders/PurchaseArmada';
import { OrderSuccess } from '@/pages/LandingPage/Orders/OrderSuccess';
import { OrderDetailPage } from '@/pages/LandingPage/Orders/OrderDetailPage';
import { OrderReviewPage } from '@/pages/LandingPage/Orders/OrderReviewPage';
import { MyProfile } from '@/pages/LandingPage/Profile/MyProfile';
import { Welcome } from '@/pages/LandingPage/Utilities/Welcome';
import FindOrder from '@/pages/LandingPage/Orders/FindOrder';
import { EditProfile } from '@/pages/LandingPage/Profile/EditProfile';
import { PromoDiscount } from '@/pages/LandingPage/Utilities/PromoDiscount';
import { Referral } from '@/pages/LandingPage/Utilities/Referral';
import { Reviews } from '@/pages/LandingPage/Utilities/Reviews';
import { CustomOrder } from '@/pages/LandingPage/Utilities/CustomOrder';
import { InvalidApiKey } from '@/pages/LandingPage/Utilities/InvalidApiKey';

// Auth Pages
import { Login } from '@/pages/LandingPage/Auth/Login';
import { Register } from '@/pages/LandingPage/Auth/Register';
import { ForgotPassword } from '@/pages/auth/ForgotPassword';

// Layout wrapper for public pages
const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};

function App() {
  const [isInvalidApiKey, setIsInvalidApiKey] = useState(false);

  useEffect(() => {
    const handleInvalidApiKey = () => setIsInvalidApiKey(true);
    window.addEventListener('invalid-api-key', handleInvalidApiKey);
    return () => window.removeEventListener('invalid-api-key', handleInvalidApiKey);
  }, []);

  if (isInvalidApiKey) {
    return (
      <ThemeProvider>
        <InvalidApiKey />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <GeneralContentProvider>
        <CheckoutProvider>
          <Router>
            <ScrollToTop />
            <Routes>
          {/* Public Routes */}
          <Route path="/" element={
            <PublicLayout>
              <Home />
            </PublicLayout>
          } />
          <Route path="/catalog" element={
            <PublicLayout>
              <Catalog />
            </PublicLayout>
          } />
          <Route path="/armada" element={
            <PublicLayout>
              <Armada />
            </PublicLayout>
          } />
          <Route path="/services" element={
            <PublicLayout>
              <Services />
            </PublicLayout>
          } />
          <Route path="/team" element={
            <PublicLayout>
              <Team />
            </PublicLayout>
          } />
          <Route path="/contact" element={
            <PublicLayout>
              <Contact />
            </PublicLayout>
          } />
          <Route path="/detail/catalog/:id" element={
            <PublicLayout>
              <CatalogDetail />
            </PublicLayout>
          } />
          <Route path="/detail/armada/:id" element={
            <PublicLayout>
              <ArmadaDetail />
            </PublicLayout>
          } />
          <Route path="/checkout/catalog/:id" element={
            <PublicLayout>
              <CatalogCheckout />
            </PublicLayout>
          } />
          <Route path="/checkout/armada/:id" element={
            <PublicLayout>
              <ArmadaCheckout />
            </PublicLayout>
          } />
          <Route path="/checkout/armada/special-request" element={
            <PublicLayout>
              <ItineraryRequest />
            </PublicLayout>
          } />
          <Route path="/payment/:type/:id" element={
            <PublicLayout>
              <Payment />
            </PublicLayout>
          } />
          <Route path="/purchase/armada/:id" element={
            <PublicLayout>
              <PurchaseArmada />
            </PublicLayout>
          } />
          <Route path="/order/success/:type/:id" element={
            <PublicLayout>
              <OrderSuccess />
            </PublicLayout>
          } />
          <Route path="/order/detail/:type/:id" element={
            <PublicLayout>
              <OrderDetailPage />
            </PublicLayout>
          } />
          <Route path="/order-review" element={
            <PublicLayout>
              <OrderReviewPage />
            </PublicLayout>
          } />
          <Route path="/myprofile" element={
            <PublicLayout>
              <MyProfile />
            </PublicLayout>
          } />
          <Route path="/welcome" element={
            <PublicLayout>
              <Welcome />
            </PublicLayout>
          } />
          <Route path="/find-order" element={
            <PublicLayout>
              <FindOrder />
            </PublicLayout>
          } />
          <Route path="/edit-profile" element={
            <PublicLayout>
              <EditProfile />
            </PublicLayout>
          } />
          <Route path="/promo-discount" element={
            <PublicLayout>
              <PromoDiscount />
            </PublicLayout>
          } />
          <Route path="/referral" element={
            <PublicLayout>
              <Referral />
            </PublicLayout>
          } />
          <Route path="/reviews/:type/:id" element={
            <PublicLayout>
              <Reviews />
            </PublicLayout>
          } />
          <Route path="/custom-order/:type/:id" element={
            <PublicLayout>
              <CustomOrder />
            </PublicLayout>
          } />
          <Route path="/invalid-apikey" element={
            <InvalidApiKey />
          } />

          {/* Auth Routes */}
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />

          {/* Dashboard Routes */}
          {/* Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
          <Toaster />
          </Router>
        </CheckoutProvider>
      </GeneralContentProvider>
    </ThemeProvider>
  );
}

export default App;