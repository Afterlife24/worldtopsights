import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { SiteFooter, SiteHeader } from '@/components/Chrome';
import { Landing } from '@/components/Landing';
import { TourCategory } from '@/components/TourCategory';
import { TourPage } from '@/components/TourPage';
import { DestinationPage } from '@/components/DestinationPage';

/** On navigation: scroll to the "#hash" target if there is one, otherwise to the top. */
function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    const target = hash && hash !== '#search' ? document.getElementById(hash.slice(1)) : null;
    if (target) target.scrollIntoView();
    else window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

function App() {
  return (
    <BrowserRouter>
      <ScrollManager />
      <a href="#main" className="skip-link">Skip to content</a>
      <SiteHeader />
      <main id="main">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/tours" element={<TourCategory />} />
          <Route path="/tours/:category" element={<TourCategory />} />
          <Route path="/tours/:category/:tour" element={<TourPage />} />
          <Route path="/destinations/:destination" element={<DestinationPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <SiteFooter />
    </BrowserRouter>
  );
}

export default App;
