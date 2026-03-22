// TOOD: replace with something awesome
export default function Nav() {
  return (
    <nav className="text-white text-4xl inter-thin tracking-[0.2em] text-center w-full flex justify-center items-center gap-32 py-6 backdrop-blur-md fixed top-0 z-99">
      <a
        href="#code"
        className="transition-all duration-300 px-10 hover:underline hover:text-white hover:drop-shadow-[0_0_120px_rgba(255,255,255,0.6)]"
      >
        Code
      </a>
      <a
        href="#projects"
        className="transition-all duration-300 px-10 hover:underline hover:text-white hover:drop-shadow-[0_0_120px_rgba(255,255,255,0.6)]"
      >
        Projects
      </a>
      <a
        href="#creative"
        className="transition-all duration-300 px-10 hover:underline hover:text-white hover:drop-shadow-[0_0_120px_rgba(255,255,255,0.6)]"
      >
        Creative
      </a>
      <a
        href="#contact"
        className="transition-all duration-300 px-10 hover:underline hover:text-white hover:drop-shadow-[0_0_120px_rgba(255,255,255,0.6)]"
      >
        Contact
      </a>
    </nav>
  );
}
