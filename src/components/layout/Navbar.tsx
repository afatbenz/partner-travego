import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, MapPin, User, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { useGeneralContent } from '@/contexts/GeneralContentContext';

export const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<{ id: number; name: string; role: string } | null>(null);
  const location = useLocation();
  const { getContentIn } = useGeneralContent();
  const brandLogo = getContentIn('general-config', 'brand-logo');

  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, [location]);

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Katalog', href: '/catalog' },
    { name: 'Armada', href: '/armada' },
    { name: 'Promo', href: '/promo-discount' },
    { name: 'Layanan', href: '/services' },
    { name: 'Tim', href: '/team' },
    { name: 'Kontak', href: '/contact' },
  ];

  const isActive = (href: string) => location.pathname === href;

  const navClasses = `fixed top-0 left-0 right-0 z-50 transition-all duration-300 print:hidden ${
    isHomePage
      ? isScrolled
        ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-lg py-2'
        : 'bg-transparent py-4'
      : 'bg-white dark:bg-gray-900 shadow-md py-2'
  }`;

  const textClasses = isHomePage && !isScrolled ? 'text-white' : 'text-gray-900 dark:text-white';

  return (
    <nav className={navClasses}>
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 shrink-0">
            {brandLogo ? (
              <img src={brandLogo} alt="Logo" className="h-10 w-auto object-contain" />
            ) : (
              <>
                <MapPin className={`h-8 w-8 ${isHomePage && !isScrolled ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`} />
                <span className={`text-2xl font-bold ${textClasses}`}>
                  {getContentIn('general-config', 'brand-name') || 'TraveGO'}
                </span>
              </>
            )}
          </Link>

          {/* Desktop Navigation - Centered */}
          <div className="hidden md:flex items-center justify-center flex-1 px-8">
            <div className="flex items-center space-x-1 lg:space-x-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-3 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                    isActive(item.href)
                      ? isHomePage && !isScrolled
                        ? 'bg-white/20 text-white'
                        : 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                      : isHomePage && !isScrolled
                        ? 'text-white/80 hover:text-white hover:bg-white/10'
                        : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right Section: Hubungi Kami + Auth */}
          <div className="hidden md:flex items-center space-x-4 shrink-0">
            <ThemeToggle />
            {user ? (
              <div className="flex items-center space-x-2">
                <Link to="/myorders">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`p-2 rounded-full ${isHomePage && !isScrolled ? 'text-white hover:bg-white/20' : 'text-gray-700 dark:text-white hover:bg-gray-100'}`}
                  >
                    <ShoppingBag className="h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/myprofile">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className={`p-2 rounded-full ${isHomePage && !isScrolled ? 'text-white hover:bg-white/20' : 'text-gray-700 dark:text-white hover:bg-gray-100'}`}
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            ) : null}
            
            <Link to="/contact">
              <Button 
                className={`rounded-full px-6 font-normal transition-all duration-300 ${
                  isHomePage && !isScrolled
                    ? 'bg-white text-blue-900 hover:bg-blue-50 shadow-lg'
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                }`}
              >
                Hubungi Kami
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              className={isHomePage && !isScrolled ? 'text-white hover:bg-white/20' : 'bg-white dark:bg-transparent dark:border-white text-gray-900 dark:text-white'}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 bg-white dark:bg-gray-900 absolute left-0 right-0 px-4 shadow-xl border-t border-gray-100 dark:border-gray-800">
            <div className="flex flex-col space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl text-base font-semibold transition-all duration-200 ${
                    isActive(item.href)
                      ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 mt-2 border-t border-gray-100 dark:border-gray-800">
                <div className="flex flex-col space-y-3">
                  {user ? (
                    <>
                      <Link to="/myorders" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="outline" className="w-full justify-start rounded-xl">
                          <ShoppingBag className="h-5 w-5 mr-3" />
                          Pesanan Saya
                        </Button>
                      </Link>
                      <Link to="/myprofile" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="outline" className="w-full justify-start rounded-xl">
                          <User className="h-5 w-5 mr-3" />
                          Profil Saya
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <Link to="/auth/login" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="outline" className="w-full rounded-xl">
                        Login
                      </Button>
                    </Link>
                  )}
                  <Link to="/contact" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                      Hubungi Kami
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
