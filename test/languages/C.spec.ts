import * as fs from "fs";
import * as path from "path";

import { newUnibeautify, Beautifier } from "unibeautify";
import beautifier from "../../src";
import { raw } from "../utils";

test(`should successfully beautify file test1.c`, () => {
  const text: string = fs
    .readFileSync(path.resolve(__dirname, `../fixtures/test1.c`))
    .toString();
  const filePath = path.resolve(__dirname, `../fixtures/test1.c`);
  const unibeautify = newUnibeautify();
  unibeautify.loadBeautifier(beautifier);
  return unibeautify
    .beautify({
      languageName: "C",
      options: {
        // unibeautify:ignore-next-line
        "C": {},
      },
      text,
      filePath,
    })
    .then(results => {
      expect(raw(results)).toMatchSnapshot();
    });
});
