/**
 * The room's sound, all of it made here: no files. There's very little of it.
 * A soft tick when something's pressed, one felted note on
 * walking up to a place, and the click of the lamp. It starts only after the
 * first click or key press (browsers insist, and they're right), stops while
 * the tab's hidden, and a small switch in the corner turns it off for good.
 */

const STORE = "room:sound";
/** Arrival notes: D major pentatonic, low and plain. */
const NOTES = [293.66, 329.63, 369.99, 440, 493.88, 587.33];

export function createSound(root: HTMLElement, signal: AbortSignal) {
    const toggle = root.querySelector<HTMLButtonElement>("[data-sound]");
    let on = true;
    try {
        on = localStorage.getItem(STORE) !== "off";
    } catch {}
    let context: AudioContext | null = null;
    let master: GainNode | null = null;
    let wet: GainNode | null = null;
    let step = 0;

    const reflect = () => {
        toggle?.setAttribute("aria-pressed", String(on));
        toggle?.setAttribute("aria-label", on ? "Turn sound off" : "Turn sound on");
    };
    reflect();

    function start() {
        if (context || !on) return;
        const Context = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!Context) return;
        context = new Context();
        master = context.createGain();
        master.gain.value = 0;
        master.gain.linearRampToValueAtTime(1, context.currentTime + 2.5);
        master.connect(context.destination);

        // A short, dark tail, so notes sit in a room and not in your ear.
        const tail = context.createBuffer(2, Math.round(context.sampleRate * 1.1), context.sampleRate);
        for (let channel = 0; channel < 2; channel++) {
            const data = tail.getChannelData(channel);
            for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 3.2);
        }
        const room = context.createConvolver();
        room.buffer = tail;
        const dark = context.createBiquadFilter();
        dark.type = "lowpass";
        dark.frequency.value = 2400;
        wet = context.createGain();
        wet.gain.value = 0.32;
        wet.connect(room).connect(dark).connect(master);

    }

    /** A voice: one enveloped oscillator into the dry mix and the room. */
    function voice(frequency: number, peak: number, attack: number, decay: number, options: { type?: OscillatorType; bend?: number; room?: number; delay?: number } = {}) {
        if (!context || !master || !wet || !on || context.state !== "running") return;
        const at = context.currentTime + (options.delay ?? 0);
        const oscillator = context.createOscillator();
        oscillator.type = options.type ?? "sine";
        oscillator.frequency.setValueAtTime(frequency, at);
        if (options.bend) oscillator.frequency.exponentialRampToValueAtTime(frequency * options.bend, at + decay);
        const envelope = context.createGain();
        envelope.gain.setValueAtTime(0.0001, at);
        envelope.gain.exponentialRampToValueAtTime(peak, at + attack);
        envelope.gain.exponentialRampToValueAtTime(0.0001, at + attack + decay);
        oscillator.connect(envelope);
        envelope.connect(master);
        if (options.room) {
            const send = context.createGain();
            send.gain.value = options.room;
            envelope.connect(send).connect(wet);
        }
        oscillator.start(at);
        oscillator.stop(at + attack + decay + 0.05);
    }

    const sound = {
        /** Something was pressed: a soft, dry tick. */
        tap() {
            voice(1500, 0.045, 0.002, 0.045, { bend: 0.55 });
            voice(420, 0.03, 0.002, 0.06, { bend: 0.7 });
        },
        /** Walked up to something: one felted note and its octave, a different one each time. */
        arrive() {
            const note = NOTES[step++ % NOTES.length];
            voice(note, 0.05, 0.012, 1.3, { room: 0.9 });
            voice(note * 2, 0.012, 0.008, 0.7, { room: 0.9 });
            voice(note * 1.5, 0.018, 0.02, 1.1, { room: 0.9, delay: 0.09 });
        },
        /** Walking away: the same idea, lower and shorter. */
        leave() {
            voice(NOTES[0] / 2, 0.04, 0.015, 0.7, { room: 0.7 });
        },
        /** The desk lamp's switch: a click down and a click up. */
        lamp() {
            voice(2600, 0.035, 0.001, 0.018, { type: "triangle", bend: 0.4 });
            voice(1900, 0.03, 0.001, 0.022, { type: "triangle", bend: 0.4, delay: 0.055 });
        },
    };

    // The first press anywhere is what lets the room make a sound at all.
    for (const type of ["pointerdown", "keydown"] as const) addEventListener(type, start, { signal, capture: true });
    // Anything pressable ticks.
    root.addEventListener(
        "click",
        (event) => {
            const pressed = (event.target as Element).closest("button, a, [data-stop]");
            if (pressed && pressed !== toggle && !pressed.closest(".playable-piano")) sound.tap();
        },
        { signal, capture: true },
    );
    toggle?.addEventListener(
        "click",
        () => {
            on = !on;
            try {
                localStorage.setItem(STORE, on ? "on" : "off");
            } catch {}
            reflect();
            if (on) {
                start();
                context?.resume();
                sound.tap();
            } else context?.suspend();
        },
        { signal },
    );
    document.addEventListener(
        "visibilitychange",
        () => {
            if (!context) return;
            if (document.hidden) context.suspend();
            else if (on) context.resume();
        },
        { signal },
    );
    signal.addEventListener("abort", () => context?.close());

    return sound;
}
