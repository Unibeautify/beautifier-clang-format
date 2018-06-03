/**
 * Wraps a string in a marker object that is used by `./raw-serializer.js` to
 * directly print that string in a snapshot without escaping all double quotes.
 * Backticks will still be escaped.
 */
export function raw(text: string) {
  if (typeof text !== "string") {
    throw new Error("Raw snapshots have to be strings.");
  }
  return {
    [Symbol.for("raw")]: text,
  };
}
