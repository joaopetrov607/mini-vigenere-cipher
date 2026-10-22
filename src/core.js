/**
 * Core implementation of the Vigenère cipher.
 *
 * Design decisions (documented so the behaviour is unambiguous):
 *
 * 1. Alphabet: the 26 uppercase ASCII letters A–Z. Text is uppercased
 *    before processing so callers do not have to normalise case themselves.
 *    The result is also uppercase, matching the convention of every
 *    reference table of the cipher.
 *
 * 2. Non-alphabetic characters are preserved verbatim and do NOT advance
 *    the key index. This is the "standard" Vigenère behaviour described
 *    by most textbooks: spaces, digits, and punctuation pass through
 *    untouched and the keyword aligns only to letters. An alternative
 *    reading is to advance the key for every input character; we do not
 *    do that because it makes round-tripping of mixed prose lossy in a
 *    way the user cannot predict.
 *
 * 3. The key is cleaned by removing every non-letter character and
 *    uppercasing what remains. An empty key is rejected — a Vigenère
 *    cipher with a zero-length keyword is undefined (it would imply a
 *    shift of nothing) and returning plaintext unchanged is a worse
 *    surprise than a thrown error.
 */

const A_CODE = 65;
const ALPHABET_SIZE = 26;

/**
 * Validate and normalise a keyword.
 *
 * Removes every non-A–Z character and uppercases the residue. Throws
 * if nothing is left, because a zero-length key produces undefined
 * behaviour (every shift would be `NaN % 26`).
 *
 * @param {string} key  Raw keyword from the caller.
 * @returns {string}    Cleaned, uppercase, letters-only key.
 * @throws {TypeError} If `key` is not a string.
 * @throws {Error} If `key` contains no letters.
 */
export function sanitizeKey(key) {
  if (typeof key !== "string") {
    throw new TypeError(`Key must be a string, got ${typeof key}`);
  }

  // /[^A-Za-z]/g — remove anything that is not an ASCII letter.
  // We do not use the /i flag and toUpperCase() chain because the
  // regex already covers both cases and a single uppercasing pass
  // is cheaper and clearer than mixing the two.
  const cleaned = key.replace(/[^A-Za-z]/g, "").toUpperCase();

  if (cleaned.length === 0) {
    throw new Error("Key must contain at least one letter");
  }

  return cleaned;
}

/**
 * Apply the Vigenère transform in a chosen direction.
 *
 * `direction` is +1 for encipher (forward through the alphabet) and
 * -1 for decipher (backward). Centralising the loop here means the
 * encipher and decipher functions cannot drift apart.
 *
 * @param {string} text       Input text; uppercased internally.
 * @param {string} key       Pre-sanitised keyword (letters only, upper).
 * @param {number} direction +1 to encipher, -1 to decipher.
 * @returns {string} The transformed text.
 */
function transform(text, key, direction) {
  const upper = text.toUpperCase();
  let out = "";
  let keyIndex = 0;

  for (let i = 0; i < upper.length; i++) {
    const code = upper.charCodeAt(i);

    // Only A–Z are shifted; everything else is copied verbatim.
    if (code < A_CODE || code > A_CODE + ALPHABET_SIZE - 1) {
      out += upper[i];
      continue;
    }

    // Convert the letter to a 0-based offset, apply the keyword shift,
    // and wrap into [0, 26). The double modulo guards against
    // negative intermediates when direction is -1.
    const letterOffset = code - A_CODE;
    const shift = key.charCodeAt(keyIndex % key.length) - A_CODE;
    const shifted = letterOffset + direction * shift;
    const wrapped = ((shifted % ALPHABET_SIZE) + ALPHABET_SIZE) % ALPHABET_SIZE;

    out += String.fromCharCode(A_CODE + wrapped);
    keyIndex++;
  }

  return out;
}

/**
 * Encipher `text` with the Vigenère cipher under `key`.
 *
 * Non-letters pass through unchanged and do not consume key letters.
 *
 * @param {string} text
 * @param {string} key
 * @returns {string}
 */
export function encipher(text, key) {
  return transform(text, sanitizeKey(key), 1);
}

/**
 * Decipher `text` encrypted under `key`.
 *
 * Inverse of {@link encipher} for the same (sanitised) key.
 *
 * @param {string} text
 * @param {string} key
 * @returns {string}
 */
export function decipher(text, key) {
  return transform(text, sanitizeKey(key), -1);
}
