# mini-vigenere-cipher

Enciphers and deciphers ASCII text with a Vigenère cipher driven by a repeating keyword.

```js
import { encipher, decipher, sanitizeKey } from "mini-vigenere-cipher";

encipher("ATTACKATDAWN", "LEMON");   // → "LXFOPVEFRNHR"
decipher("LXFOPVEFRNHR", "LEMON");   // → "ATTACKATDAWN"
sanitizeKey("H3ll0 W@rld!");        // → "HLLOWRLD"
```

## Why this exists

A focused, zero-dependency Vigenère implementation for cases where you need the cipher itself — not a full cryptography suite. The trade-off is deliberate: the API does two things (`encipher`, `decipher`) plus one helper (`sanitizeKey`), and nothing else.

## Behaviour, stated plainly

The alphabet is the 26 uppercase ASCII letters A–Z. Input text is uppercased before processing; output is always uppercase. Non-alphabetic characters (spaces, digits, punctuation) pass through unchanged and do **not** advance the key index — the keyword aligns to letters only. The key is sanitised by stripping every non-letter and uppercasing the remainder; a key containing no letters throws.

## Awkward edge you will hit

Because non-letters do not consume key letters, the same keyword produces different ciphertext depending on where spaces sit. If you encipher `"HELLO WORLD"` and `"HELLOWORLD"` with the same key, the `WORLD` portions will differ. This is the standard textbook behaviour, but it surprises anyone expecting positional alignment to the raw byte stream.
