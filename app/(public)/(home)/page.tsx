
import TypeAnimationBlock from "./components/type-animation-block";
import ProductEcosystemSection from "./components/product-ecosystem-section";
import SmartMatchSection from "./components/smart-match-section";
import QueryDashboardSection from "./components/query-dashboard-section";
import DispatchSection from "./components/dispatch-section";
import { CtaCard } from "./components/cta-card";
import ComparisonSection from "./components/comparison-section";
import TrustStatsSection from "./components/trust-stats-section";
import FinalCtaSection from "./components/final-cta-section";
import HomeContentShell from "./components/home-content-shell";


const Home = () => {
  return (
    <>
      <section className="sr-only">
        <h1>
          The modern way to query literary agents.
        </h1>
        <p>
          Find the best for your writing agents fast, track every submission in one place, and
          stay current on agent openings, MSWLs, and publishing intel — without
          juggling spreadsheets and scattered research.
        </p>
      </section>
      <div className="flex w-full flex-col pb-24 md:block md:pb-0">
        <HomeContentShell>
          <TypeAnimationBlock />
        </HomeContentShell>
      </div>
      <CtaCard />
      <ProductEcosystemSection />
      <SmartMatchSection />
      <QueryDashboardSection />
      <DispatchSection />
      <ComparisonSection />
      <TrustStatsSection />
      <FinalCtaSection />
    </>
  );
};

export default Home;
