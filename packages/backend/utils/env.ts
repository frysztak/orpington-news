import fs from 'fs';

interface Options {
  /**
   * If `true` and variable called `x` is not found, will try to:
   * 1. Read variable `${x}_FILE`
   * 2. Read contents from file pointed to by `${x}_FILE`
   */
  fileFallback: boolean;
}

const defaultOptions: Options = {
  fileFallback: false,
};

export const readEnvVariable = (
  name: string,
  options: Options = defaultOptions
): string => {
  if (process.env[name]) {
    return process.env[name]!;
  }

  const { fileFallback } = options;
  if (fileFallback) {
    const varName = `${name}_FILE`;
    if (process.env[varName]) {
      const fileName = process.env[varName]!;
      return fs.readFileSync(fileName, { encoding: 'utf-8' });
    }
  }

  throw new Error(`${name} not set!`);
};
