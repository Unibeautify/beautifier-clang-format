import * as fs from "fs";
import * as path from "path";

import { newUnibeautify, Beautifier } from "unibeautify";
import beautifier from "@src";
import { raw } from "@test/utils";

test(`should successfully beautify file with config one directory up`, () => {
  const unibeautify = newUnibeautify();
  unibeautify.loadBeautifier(beautifier);
  const text: string = fs
    .readFileSync(path.resolve(__dirname, "../../../fixtures/test1.c"))
    .toString();
  return unibeautify
    .beautify({
      filePath: path.resolve(__dirname),
      projectPath: path.resolve(__dirname, "../"),
      languageName: "C",
      options: {
        "C": {
          "ClangFormat": {
            prefer_beautifier_config: true
          }
        } as any,
      },
      text,
    })
    .then(results => {
      expect(raw(results)).toMatchSnapshot();
    });
});
