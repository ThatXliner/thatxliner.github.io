/** Measure the ink against the actual chapters so it follows text reflow. */
export function initStoryMotion() {
    const journey = document.querySelector<HTMLElement>('.journey');
    if (!journey) return;
    const svg = journey.querySelector<SVGSVGElement>('.journey-trail')!;
    const ink = svg.querySelector<SVGPathElement>('.trail-ink')!;
    const guide = svg.querySelector<SVGPathElement>('.trail-guide')!;
    const pen = svg.querySelector<SVGGElement>('.trail-pen')!;
    const chapters = [...journey.querySelectorAll<HTMLElement>('.chapter')];
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let length = 0;
    let samples: { y: number; length: number }[] = [];
    let current = -1;
    let measureFrame = 0;
    let renderFrame = 0;
    let top = 0;
    let anchors: number[] = [];
    const clamp = (n: number) => Math.max(0, Math.min(1, n));
    const staticMode = () => reduced.matches || document.documentElement.hasAttribute('data-noanim');

    function measure() {
        const box = journey!.getBoundingClientRect();
        top = box.top + window.scrollY;
        const mobile = matchMedia('(max-width: 699px)').matches;
        const inset = mobile ? 15 : 123;
        const positions = chapters.map((_, i) => i % 2 ? box.width - inset : inset);
        anchors = chapters.map(chapter => chapter.offsetTop + 46);
        const firstX = positions[0];
        let d = `M ${firstX + (mobile ? 4 : 37)} 8 C ${firstX - 25} 28 ${firstX + 25} 47 ${firstX} ${anchors[0]}`;
        anchors.forEach((y, i) => {
            const x = positions[i];
            const side = i % 2 ? -1 : 1;
            const r = mobile ? 7 : 13;
            d += ` C ${x - r * 2 * side} ${y - r} ${x - r * side} ${y + r * 2} ${x + 3 * side} ${y + r} C ${x + r * 2 * side} ${y} ${x + r * side} ${y - r} ${x} ${y}`;
            const copy = chapters[i].querySelector<HTMLElement>('.chapter-copy')!;
            // Cross the page only below the prose, in the space between chapters.
            const turnY = chapters[i].offsetTop + copy.offsetTop + copy.offsetHeight + 32;
            const nextY = anchors[i + 1] ?? journey!.offsetHeight - 30;
            const nextX = positions[i + 1] ?? x;
            const bow = mobile ? 10 : 34;
            d += ` C ${x + bow * side} ${y + 75} ${x - bow * side} ${turnY - 65} ${x} ${turnY}`;
            const gap = nextY - turnY;
            d += ` C ${x + (nextX - x) * .16} ${turnY + gap * .52} ${nextX - (nextX - x) * .1} ${nextY - gap * .58} ${nextX} ${nextY}`;
        });
        svg.setAttribute('viewBox', `0 0 ${box.width} ${journey!.offsetHeight}`);
        guide.setAttribute('d', d);
        ink.setAttribute('d', d);
        length = ink.getTotalLength();
        ink.style.strokeDasharray = `${length}`;
        // A monotonic envelope completes each loop without jumping backward.
        let maxY = 0;
        samples = Array.from({ length: Math.ceil(length / 12) + 1 }, (_, i) => {
            const at = Math.min(i * 12, length);
            maxY = Math.max(maxY, ink.getPointAtLength(at).y);
            return { y: maxY, length: at };
        });
        samples.push({ y: journey!.offsetHeight, length });
        current = -1;
        journey!.classList.add('motion-ready');
        scheduleRender();
    }
    function render() {
        renderFrame = 0;
        const readY = window.scrollY + window.innerHeight * .64 - top;
        let low = 0;
        let high = samples.length;
        while (low < high) {
            const middle = (low + high) >> 1;
            if (samples[middle].y >= readY) high = middle;
            else low = middle + 1;
        }
        const target = staticMode() ? length : readY < 0 ? 0 : (samples[low]?.length ?? length);
        if (current < 0 || staticMode()) current = target;
        current += (target - current) * .16;
        if (Math.abs(target - current) < .2) current = target;
        ink.style.strokeDashoffset = `${length - current}`;
        const point = ink.getPointAtLength(current);
        pen.setAttribute('transform', `translate(${point.x} ${point.y})`);
        pen.style.opacity = !staticMode() && current > 1 && current < length - 1 ? '1' : '0';
        chapters.forEach((chapter, i) => {
            const progress = staticMode() ? 1 : clamp((readY - anchors[i] + 110) / 190);
            chapter.style.setProperty('--chapter-progress', `${progress}`);
            chapter.classList.toggle('is-written', progress > .45);
        });
        if (current !== target) scheduleRender();
    }
    function scheduleRender() {
        if (!renderFrame) renderFrame = requestAnimationFrame(render);
    }
    function scheduleMeasure() {
        if (!measureFrame) {
            measureFrame = requestAnimationFrame(() => {
                measureFrame = 0;
                measure();
            });
        }
    }
    function start() {
        window.addEventListener('scroll', scheduleRender, { passive: true });
        window.addEventListener('resize', scheduleMeasure, { passive: true });
        reduced.addEventListener('change', scheduleRender);
        const resizeObserver = new ResizeObserver(scheduleMeasure);
        resizeObserver.observe(journey);
        document.fonts.ready.then(scheduleMeasure);
        if (staticMode()) measure();
        else scheduleMeasure();
    }

    if (staticMode()) {
        start();
    } else {
        const observer = new IntersectionObserver(([entry]) => {
            if (!entry.isIntersecting) return;
            observer.disconnect();
            start();
        }, { rootMargin: '100% 0px' });
        observer.observe(journey);
    }
}
