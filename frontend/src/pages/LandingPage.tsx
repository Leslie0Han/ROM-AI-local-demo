import { Hero } from '../sections/Hero';
import { AnalysisFeature } from '../sections/AnalysisFeature';
import { DataInsights } from '../sections/DataInsights';
import { CentralHub } from '../sections/CentralHub';
import { AIDesignAgentFeature } from '../sections/AIDesignAgentFeature';
import { KnowledgeBaseFeature } from '../sections/KnowledgeBaseFeature';
import { DashboardDemo } from '../sections/DashboardDemo';
import { ReportCarousel } from '../sections/ReportCarousel';
import { Footer } from '../sections/Footer';

export function LandingPage() {
  return (
    <>
      <Hero />
      <AnalysisFeature />
      <DataInsights />
      <CentralHub />
      <AIDesignAgentFeature />
      <KnowledgeBaseFeature />
      <DashboardDemo />
      <ReportCarousel />
      <Footer />
    </>
  );
}
