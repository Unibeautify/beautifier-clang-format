import {
  Beautifier,
  Language,
  BeautifierBeautifyData,
  DependencyType,
  ExecutableDependency,
} from "unibeautify";
import * as readPkgUp from "read-pkg-up";
import * as tmp from "tmp";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

const { pkg } = readPkgUp.sync({ cwd: __dirname });

export const beautifier: Beautifier = {
  name: "clang-format",
  package: pkg,
  badges: [
    {
      description: "Build Status",
      url:
        "https://travis-ci.com/Unibeautify/beautifier-clang-format.svg?branch=master",
      href: "https://travis-ci.com/Unibeautify/beautifier-clang-format",
    },
    {
      description: "Test Coverage",
      url:
        "https://api.codeclimate.com/v1/badges/8b4e5b19de96f4744ffa/test_coverage",
      href:
        "https://codeclimate.com/github/Unibeautify/beautifier-clang-format/test_covera" +
        "ge",
    },
    {
      description: "Maintainability",
      url:
        "https://api.codeclimate.com/v1/badges/8b4e5b19de96f4744ffa/maintainability",
      href:
        "https://codeclimate.com/github/Unibeautify/beautifier-clang-format/maintainabi" +
        "lity",
    },
    {
      description: "Greenkeeper",
      url:
        "https://badges.greenkeeper.io/Unibeautify/beautifier-clang-format.svg",
      href: "https://greenkeeper.io/",
    },
  ],
  options: {
    "C": true,
    "C++": true,
    Java: true,
    "Objective-C": true
  },
  dependencies: [
    {
      type: DependencyType.Executable,
      name: "clang-format",
      program: "clang-format",
      parseVersion: [/clang-format version (\d+\.\d+\.\d+)/],
      homepageUrl: "https://clang.llvm.org/docs/ClangFormat.html",
      installationUrl: "https://clang.llvm.org/docs/ClangFormat.html",
      bugsUrl: "https://clang.llvm.org/docs/ClangFormat.html",
      badges: [],
    },
  ],
  resolveConfig: ({ filePath, projectPath }) => {
    const configFiles: string[] = [".clang-format", "_clang-format"];
    return findFile({
      finishPath: projectPath,
      startPath: filePath,
      fileNames: configFiles,
    })
      .then(configFile => ({ filePath: configFile }))
      .catch(err => {
        // tslint:disable-next-line no-console
        console.log(err);
        return Promise.resolve({});
      });
  },
  beautify({
    text,
    dependencies,
    filePath,
    beautifierConfig,
  }: BeautifierBeautifyData) {
    const clangFormat = dependencies.get<ExecutableDependency>("clang-format");
    const config =
      beautifierConfig && beautifierConfig.filePath
        ? `--style=${beautifierConfig.filePath}`
        : "";
    // tslint:disable-next-line no-console
    console.log(`Using config: ${config}`);
    return clangFormat
    .run({
      args: [`-assume-filename=${filePath}`],
      stdin: text,
    })
    .then(({ exitCode, stderr, stdout }) => {
      if (exitCode) {
        return Promise.reject(stderr);
      }
      return Promise.resolve(stdout);
    });
  },
};

function findFile({
  finishPath = "/",
  startPath = finishPath,
  fileNames,
}: {
  startPath: string | undefined;
  finishPath: string | undefined;
  fileNames: string[];
}): Promise<string> {
  const filePaths = fileNames.map(fileName => path.join(startPath, fileName));
  return Promise.all(filePaths.map(doesFileExist))
    .then(exists => filePaths.filter((filePath, index) => exists[index]))
    .then(foundFilePaths => {
      if (foundFilePaths.length > 0) {
        return foundFilePaths[0];
      }
      if (startPath === finishPath) {
        return Promise.reject("No config file found");
      }
      const parentDir = path.resolve(startPath, "../");
      return findFile({ startPath: parentDir, finishPath, fileNames });
    });
}

function doesFileExist(filePath: string): Promise<boolean> {
  return new Promise(resolve => {
    fs.access(filePath, fs.constants.R_OK, error => resolve(!error));
  });
}

// function readFile(filePath: string): Promise<string> {
//   return new Promise((resolve, reject) => {
//     fs.readFile(filePath, (error, data) => {
//       if (error) {
//         return reject(error);
//       }
//       return resolve(data.toString());
//     });
//   });
// }

export default beautifier;
