export function generaterandomInteger(min, max) {
    const rand = min + Math.random() * (max + 1 - min);
    return Math.floor(rand);
}

export function generateSet(min, max) {
    const set = new Set();

    while (set.size < max) {
        const randomNumber = generaterandomInteger(min, max);
        set.add(randomNumber);
    }

    return set;
}
