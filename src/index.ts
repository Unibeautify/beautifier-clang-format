import {
  Beautifier,
  BeautifierBeautifyData,
  DependencyType,
  ExecutableDependency,
  ResolvedConfig,
} from "unibeautify";
import * as readPkgUp from "read-pkg-up";
import * as fs from "fs";
import * as path from "path";
import cosmiconfig from "cosmiconfig";

const pkg = readPkgUp.sync({ cwd: __dirname })!.packageJson;

export const beautifier: Beautifier = {
  name: "ClangFormat",
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
    // unibeautify:ignore-next-line
    "C": true,
    "C++": true,
    Java: true,
    "Objective-C": true,
  },
  dependencies: [
    {
      type: DependencyType.Executable,
      name: "ClangFormat",
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
        console.error(err);
        return Promise.resolve({});
      });
  },
  beautify({
    text,
    dependencies,
    filePath,
    beautifierConfig,
  }: BeautifierBeautifyData) {
    const clangFormat = dependencies.get<ExecutableDependency>("ClangFormat");
    return generateConfigArgs(beautifierConfig).then(configArgs => {
      // tslint:disable-next-line no-console
      console.error(`Using config: ${configArgs}`);
      return clangFormat
        .run({
          args: [`-assume-filename=${filePath}`, ...configArgs],
          stdin: text,
        })
        .then(({ exitCode, stderr, stdout }) => {
          if (exitCode) {
            return Promise.reject(stderr);
          }
          return Promise.resolve(stdout);
        });
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

function generateConfigArgs(
  beautifierConfig?: ResolvedConfig
): Promise<string[]> {
  if (beautifierConfig && beautifierConfig.filePath) {
    return loadConfigurationFromFile(beautifierConfig.filePath).then(
      (config: string) => {
        return [`-style=${config}`];
      }
    );
  }
  return Promise.resolve(["-style=file"]);
}

function loadConfigurationFromFile(
  filePath: string
): Promise<string | undefined> {
  const configExplorer = cosmiconfig("", {});
  return configExplorer
    .load(filePath)
    .then(result => {
      if (result) {
        return JSON.stringify(result.config);
      }
    })
    .catch(error => {
      return Promise.reject(error);
    });
}

export default beautifier;
