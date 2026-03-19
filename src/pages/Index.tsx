import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import Benefits from '@/components/Benefits';
import Coverage from '@/components/Coverage';
import LeadCapture from '@/components/LeadCapture';
import Footer from '@/components/Footer';
import Testimonials from '@/components/Testimonials';
import SEOHead, { businessStructuredData, faqStructuredData } from '@/components/SEOHead';


const Index = () => {
  const combinedStructuredData = [businessStructuredData, faqStructuredData];

  return (
    <>
      <SEOHead 
        structuredData={combinedStructuredData}
        canonicalUrl="https://powerfulimpactwindows.com"
      />
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <Hero />
          <Services />
          <Benefits />
          <Testimonials />
          <LeadCapture source="Landing Page" />
          <Coverage />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;