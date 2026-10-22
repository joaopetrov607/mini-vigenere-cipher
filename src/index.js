/**
 * mini-vigenere-cipher — public API.
 *
 * Exports {@link encipher}, {@link decipher}, and {@link sanitizeKey}.
 * See README.md for the precise semantics each function guarantees.
 */

import { encipher, decipher, sanitizeKey } from "./core.js";

export { encipher, decipher, sanitizeKey };
