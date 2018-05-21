import * as fs from "fs";
import * as path from "path";
import { newUnibeautify, Beautifier } from "unibeautify";
import beautifier from "../../src";
import { raw } from "../utils";
const tmp = require("tmp");
jest.mock("tmp", () => ({
  file(options: any, callback: any) {
    return callback(new Error("Create file failed"));
  },
}));
// tslint:disable:mocha-no-side-effect-code
test(`should error creating tmp file`, () => {
  const text: string = `out_unlock:up(&core_lists);return res;}`;
  const unibeautify = newUnibeautify();
  unibeautify.loadBeautifier(beautifier);
  return expect(
    unibeautify.beautify({
      languageName: "C",
      options: {
        "C": {},
      },
      text,
    })
  ).rejects.toThrowError("Create file failed");
});
