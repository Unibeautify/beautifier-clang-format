import { newUnibeautify, Beautifier } from "unibeautify";
import beautifier from "../src";

test("should successfully install beautifier", () => {
  const unibeautify = newUnibeautify();
  unibeautify.loadBeautifier(beautifier);

  expect(unibeautify.loadedBeautifiers.map(curr => curr.name)).toEqual([
    beautifier.name,
  ]);
});
