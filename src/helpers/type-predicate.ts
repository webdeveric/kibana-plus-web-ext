export const isStringArray = (input: unknown): input is string[] =>
  Array.isArray(input) &&
  input.every((item: unknown) => typeof item === 'string');
