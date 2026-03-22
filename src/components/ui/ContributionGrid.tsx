import ContributionCard, { type Contribution } from "./ContributionCard";
import { StaggerContainer, StaggerItem } from "./ScrollReveal";

export default function ContributionGrid({ contributions }: { contributions: Contribution[] }) {
  return (
    <StaggerContainer stagger={0.1} className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
      {contributions.map((c) => (
        <StaggerItem key={c.name}>
          <ContributionCard contribution={c} />
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}
