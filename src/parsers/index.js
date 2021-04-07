import parseBloxbergV1 from "./parseBloxbergV1";
import parseV3 from './parseV3';
import parseV1 from './parseV1';
import parseV2 from './parseV2';

export const versionParserMap = {
  1: parseBloxbergV1,
  2: parseV1,
  3: parseV2,
  4: parseV3
};
