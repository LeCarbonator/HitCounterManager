/**
 * Converts an integer to a Roman numeral string representation.
 *
 * If the number is negative or zero, it will simply return the stringified number.
 *
 * @param {number} n - The integer to convert.
 * @returns {string} - The Roman numeral string representation of the integer.
 *
 * @example
 * intToRomanStr(10) // returns "X"
 * intToRomanStr(58) // returns "LVIII"
 * intToRomanStr(1994) // returns "MCMXCIV"
 * intToRomanStr(0) // returns "0"
 * intToRomanStr(-5) // returns "-5"
 */
export function intToRomanStr(n: number): string {
    if (isNaN(n) || n <= 0) return n.toString();

    const weights: [string, number][] = [
        ['M', 1000],
        ['CM', 900],
        ['D', 500],
        ['CD', 400],
        ['C', 100],
        ['XC', 90],
        ['L', 50],
        ['XL', 40],
        ['X', 10],
        ['IX', 9],
        ['V', 5],
        ['IV', 4],
        ['I', 1]
    ];

    let roman = '';

    for (const [letters, val] of weights) {
        while (n >= val) {
            roman += letters;
            n -= val;
        }
    }
    return roman;
}

/**
 * This function transforms the provided number into a floored string and pads
 * the start with leading zeroes up to the provided digits length.
 * If the number has more digits than the provided length, it returns the unpadded number.
 * @param {number} n - The number to convert.
 * @param {number} digits - The number of digits to pad the number with.
 * @returns {string} - The formatted and floored number.
 *
 * @example
 * intFloorAndFill(123, 4) // returns "0123"
 * intFloorAndFill(123, 2) // returns "123"
 * intFloorAndFill(123.45, 2) // returns "123"
 * intFloorAndFill(123.45, 3) // returns "123"
 * intFloorAndFill(123.45, 4) // returns "0123"
 */
export function intFloorAndFill(n: number, digits: number): string {
    if (digits <= 0) {
        return Math.floor(n).toString();
    }

    if (digits >= n.toString().length) {
        return Math.floor(n).toString().padStart(digits, '0');
    }

    return Math.floor(n).toString();
}

/**
 * Generate a span element with the provided data.
 * @param {string} id - The id of the span element.
 * @param {string} styleClass - The class to apply to the span element.
 * @param {string} content - The text within the span element.
 * @returns {HTMLSpanElement} A span element.
 */
export function SpanFactory(
    id: string,
    styleClass: string,
    content: string
): HTMLSpanElement {
    const spanElement = document.createElement('span');
    spanElement.id = id;
    spanElement.classList.add(...styleClass.split(' '));
    spanElement.textContent = content;
    return spanElement;
}

/**
 * Converts a time in milliseconds to a formatted string.
 * Milliseconds will be displayed as subtext.
 * @param {number} n - The time in milliseconds.
 * @param {boolean} showMs - A flag indicating whether to include milliseconds in the output.
 * Milliseconds will have 10ms accuracy.
 * @returns {string} - The formatted time string.
 *
 * @example
 * intToTimeStr(123456789, true) // returns "34:17:36<sub>&nbsp;78</sub>"
 * intToTimeStr(123456789, false) // returns "34:17:36"
 * intToTimeStr(61000, false) // returns "1:01"
 * intToTimeStr(1000, false) // returns "1"
 * intToTimeStr(0, false) // returns "0"
 * intToTimeStr(NaN, false) // returns "0"
 */
export function intToTimeStr(n: number, showMs: boolean): string {
    if (isNaN(n)) return '0';

    const ms = n % 1000;
    n /= 1000;
    const seconds = n % 60;
    n /= 60;
    const minutes = n % 60;
    n /= 60;
    const hours = n;

    let output = '';
    let padNumber = false;

    if (hours >= 1) {
        output += `${Math.floor(hours)}`;
        output += ':';
        padNumber = true;
    }

    if (hours + minutes >= 1) {
        output += intFloorAndFill(minutes, padNumber ? 2 : 0);
        output += ':';
        padNumber = true;
    }

    output += intFloorAndFill(seconds, padNumber ? 2 : 0);

    if (!showMs) return output;

    output += `<sub>&nbsp;${intFloorAndFill(ms / 10, 2)}</sub>`; // 10 ms precision

    return output;
}

/**
 * Converts an integer to a signed string representation.
 *
 * @param {number} n - The integer to convert.
 * @returns {string} - The signed string representation of the integer.
 *
 * @example
 * intToSignedString(10) // returns "+10"
 * intToSignedString(-5) // returns "-5"
 * intToSignedString(0) // returns "0"
 */
export function intToSignedString(n: number): string {
    if (n == 0) return '0';
    if (n > 0) return `+${n}`;
    return n.toString();
}

/**
 * This function creates the session progress star.
 *
 * @returns {HTMLImageElement} - The created image element.
 *
 * @href 'img_star.png';
 */
export function SessionProgressStar(): HTMLImageElement {
    const image = document.createElement('img');
    image.src = 'img_star.png';
    image.height = 21;
    return image;
}

/**
 * This function creates an image element representing a cross or a checkmark based on the number of hits.
 *
 * @param {number} hits - The number of hits.
 * @returns {string} - The created image element.
 *
 * @href 'img_cross.png'
 * @href 'img_check.png'
 * @href 'img_bar.png'
 *
 * @example
 * showCrossOrCheckmark(10) // returns an image element with src='img_cross.png' and height=15
 * showCrossOrCheckmark(0) // returns an image element with src='img_check.png' and height=21
 */
export function CrossOrCheckmark(hits: number): string {
    if (hits > 0) {
        return '<img src="img_cross.png" height="15px">';
    }
    if (hits === 0) {
        return '<img src="img_check.png", height:"21px">';
    }
    return '<img src="img_bar.png" height="21px">';
}
