import ProjectCard, { type Project } from "./ProjectCard";
import { StaggerContainer, StaggerItem } from "./ScrollReveal";

export default function ProjectGrid({ projects }: { projects: Project[] }) {
  return (
    <StaggerContainer stagger={0.08} className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
      {projects.map((project) => (
        <StaggerItem key={project.name}>
          <ProjectCard project={project} />
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}
