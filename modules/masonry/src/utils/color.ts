/** Matches `#rgb` and `#rrggbb`, capturing nothing — used only to reject anything else. */
const HEX_COLOR = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

/**
 * Expands `#rgb` to the six digits of `#rrggbb`, and returns the six digits of an already-long
 * form unchanged.
 */
function normalizeHex(hex: string): string {
    const digits = hex.slice(1);
    return digits.length === 3
        ? digits
              .split('')
              .map((d) => d + d)
              .join('')
        : digits;
}

/**
 * Darkens a hex color, keeping its hue and saturation.
 *
 * The drop happens in HSL rather than by mixing toward black in RGB: mixing muddies the hue, and a
 * selection highlight has to stay recognisably the brick's own color to read as belonging to it.
 * Grays stay gray, since a zero saturation survives the round trip.
 *
 * @param hex - source color as `#rgb` or `#rrggbb`
 * @param amount - how far to drop the lightness toward black, 0 (unchanged) to 1 (black)
 * @returns the darkened color as `#rrggbb`, or `hex` untouched when it isn't a plain hex color
 */
export function darkenColor(hex: string, amount: number): string {
    if (!HEX_COLOR.test(hex)) return hex;

    const digits = normalizeHex(hex);
    const r = parseInt(digits.slice(0, 2), 16) / 255;
    const g = parseInt(digits.slice(2, 4), 16) / 255;
    const b = parseInt(digits.slice(4, 6), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const chroma = max - min;

    const l = (max + min) / 2;
    const s = chroma === 0 ? 0 : chroma / (1 - Math.abs(2 * l - 1));

    let h = 0;
    if (chroma !== 0) {
        if (max === r) h = ((g - b) / chroma) % 6;
        else if (max === g) h = (b - r) / chroma + 2;
        else h = (r - g) / chroma + 4;
        h *= 60;
        if (h < 0) h += 360;
    }

    const clamped = Math.min(Math.max(amount, 0), 1);
    const dropped = l * (1 - clamped);

    // HSL back to RGB, via the standard chroma/intermediate decomposition.
    const c = (1 - Math.abs(2 * dropped - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = dropped - c / 2;

    const [r1, g1, b1] =
        h < 60
            ? [c, x, 0]
            : h < 120
              ? [x, c, 0]
              : h < 180
                ? [0, c, x]
                : h < 240
                  ? [0, x, c]
                  : h < 300
                    ? [x, 0, c]
                    : [c, 0, x];

    const toHex = (v: number) =>
        Math.round((v + m) * 255)
            .toString(16)
            .padStart(2, '0');

    return `#${toHex(r1)}${toHex(g1)}${toHex(b1)}`;
}
