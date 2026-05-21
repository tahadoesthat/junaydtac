import HeroSection from '@/components/hero-section';
import ProjectPipeline from '@/components/project-pipeline';
import ArchitecturalTimeline from '@/components/architectural-timeline';
import InboundTerminal from '@/components/inbound-terminal';

export default function Home() {
  return (
    <div className="flex flex-col relative z-10 w-full">
        <HeroSection />
        <ProjectPipeline />
        <ArchitecturalTimeline />
        <InboundTerminal />
    </div>
  );
}
