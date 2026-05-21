import HeroSection from '@/components/hero-section';
import ProjectPipeline from '@/components/project-pipeline';
import ArchitecturalTimeline from '@/components/architectural-timeline';
import InboundTerminal from '@/components/inbound-terminal';
import Header from '@/components/header';

export default function Home() {
  return (
    <div className="flex flex-col relative z-10 w-full">
        {/* Persistent Social Header */}
        <Header />

        <HeroSection />

        {/* Phase 2: The Project Node Network */}
        <ProjectPipeline />

        {/* Phase 3: The Interactive Resume / Blueprint */}
        <ArchitecturalTimeline />

        {/* Phase 4: Inbound Terminal (Discord Integrated) */}
        <InboundTerminal />
    </div>
  );
}
