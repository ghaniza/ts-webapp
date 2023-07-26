export const print = (source: string, text: string, padding = 30) => {
  let prefix = `[${source}]`;
  const diff = padding - source.length - 3;

  for (let p = 0; p < diff; p++) {
    prefix += ".";
  }

  console.log(`${prefix}: `, text);
};
