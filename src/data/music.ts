export interface Instrument {
    name: string;
    since: number;
    role: string;
    awards: string[];
}

export const instruments: Instrument[] = [
    { name: "Piano", since: 2017, role: "Solo pianist", awards: ["Certificate of Merit Level 10, State Honors", "3rd place, USOMC Intermediate Baroque (2023)"] },
    { name: "Trombone", since: 2018, role: "Concert band & jazz band", awards: ["2nd place, Folsom Jazz Festival (2025)"] },
];

export const streaming = {
    spotify: "https://open.spotify.com/artist/3CfXIgxCs9Sv7eVgZzqSEj",
    appleMusic: "https://music.apple.com/us/artist/bryan-hu/1751789628",
    appleArtistId: "1751789628",
};

export interface Release {
    title: string;
    date: string;
    artwork: string;
    url: string;
}

/**
 * Releases, from Apple's public lookup API at build time, so a new single
 * shows up without anyone editing this file. A failed lookup builds with none.
 */
export async function getReleases(): Promise<Release[]> {
    try {
        const response = await fetch(`https://itunes.apple.com/lookup?id=${streaming.appleArtistId}&entity=album&limit=50`);
        const data = await response.json();
        return data.results
            .filter((item: { wrapperType: string }) => item.wrapperType === "collection")
            .map((item: { collectionName: string; releaseDate: string; artworkUrl100: string; collectionViewUrl: string }) => ({
                title: item.collectionName.replace(/ - (Single|EP)$/, ""),
                date: item.releaseDate.slice(0, 10),
                artwork: item.artworkUrl100.replace("100x100", "600x600"),
                url: item.collectionViewUrl,
            }))
            .sort((a: Release, b: Release) => b.date.localeCompare(a.date));
    } catch {
        return [];
    }
}
