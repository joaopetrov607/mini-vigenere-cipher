import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { encipher, decipher, sanitizeKey } from "../src/index.js";

describe("encipher", () => {
  it("encrypts the canonical textbook example", () => {
    // Classic Vigenère illustration: ATTACKATDAWN with key LEMON.
    assert.equal(encipher("ATTACKATDAWN", "LEMON"), "LXFOPVEFRNHR");
  });

  it("preserves spaces and punctuation without advancing the key", () => {
    // The space and comma are copied through; the key letter that
    // would have aligned to them is reused for the next letter.
    const result = encipher("HELLO, WORLD!", "KEY");
    assert.equal(result, "RIJVS, UYVJN!");
  });

  it("accepts a lowercase key and uppercase key interchangeably", () => {
    assert.equal(encipher("HELLO", "key"), encipher("HELLO", "KEY"));
  });

  it("accepts a lowercase plaintext and uppercases the result", () => {
    assert.equal(encipher("hello", "KEY"), "RIJVS");
  });

  it("returns plaintext unchanged when the key is a single A", () => {
    // Shift of zero for every position.
    assert.equal(encipher("SOMETHING", "A"), "SOMETHING");
  });
});

describe("decipher", () => {
  it("inverts encipher for the textbook example", () => {
    const key = "LEMON";
    const cipher = encipher("ATTACKATDAWN", key);
    assert.equal(decipher(cipher, key), "ATTACKATDAWN");
  });

  it("round-trips mixed prose", () => {
    const key = "PASSPHRASE";
    const plain = "Meet at dawn, bring the map.";
    assert.equal(decipher(encipher(plain, key), key), plain.toUpperCase());
  });

  it("round-trips when the key is longer than the text", () => {
    const key = "VERYLONGKEYINDEED";
    const plain = "SHORT";
    assert.equal(decipher(encipher(plain, key), key), plain.toUpperCase());
  });
});

describe("sanitizeKey", () => {
  it("strips non-letters and uppercases", () => {
    assert.equal(sanitizeKey("H3ll0 W@rld!"), "HLLWRLD");
  });

  it("returns uppercase letters unchanged", () => {
    assert.equal(sanitizeKey("ABC"), "ABC");
  });

  it("throws on a key with no letters", () => {
    assert.throws(() => sanitizeKey("12345!"), /at least one letter/);
  });

  it("throws on a non-string key", () => {
    assert.throws(() => sanitizeKey(42), TypeError);
  });
});

describe("encipher edge cases", () => {
  it("treats an empty plaintext as an empty result", () => {
    assert.equal(encipher("", "KEY"), "");
  });

  it("passes digits and symbols through verbatim", () => {
    assert.equal(encipher("12345", "KEY"), "12345");
  });
});
