// TOOD: replace with something awesome
export default function Nav() {
  return (
    <nav className="text-white text-sm sm:text-base md:text-xl lg:text-2xl inter-thin tracking-[0.1em] md:tracking-[0.2em] text-center w-full flex justify-center items-center gap-3 sm:gap-6 md:gap-12 lg:gap-20 py-3 md:py-5 backdrop-blur-md fixed top-0 z-99">
      <a
        href="#code"
        className="transition-all duration-300 px-2 sm:px-4 md:px-10 hover:underline hover:text-white hover:drop-shadow-[0_0_120px_rgba(255,255,255,0.6)]"
      >
        Code
      </a>
      <a
        href="#projects"
        className="transition-all duration-300 px-2 sm:px-4 md:px-10 hover:underline hover:text-white hover:drop-shadow-[0_0_120px_rgba(255,255,255,0.6)]"
      >
        Projects
      </a>
      <a
        href="#creative"
        className="transition-all duration-300 px-2 sm:px-4 md:px-10 hover:underline hover:text-white hover:drop-shadow-[0_0_120px_rgba(255,255,255,0.6)]"
      >
        Creative
      </a>
      <a
        href="#contact"
        className="transition-all duration-300 px-2 sm:px-4 md:px-10 hover:underline hover:text-white hover:drop-shadow-[0_0_120px_rgba(255,255,255,0.6)]"
      >
        Contact
      </a>
    </nav>
  );
}
