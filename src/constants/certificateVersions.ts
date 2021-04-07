/* eslint @typescript-eslint/camelcase: 0 */
enum Versions {
  V1_1 = '1.1',
  V1_2 = '1.2',
  V2_0 = '2.0',
  V3_0_alpha = '3.0-alpha',
  V1_0_bloxberg = '1.0-bloxberg'
}

export function isV1 (version: string): boolean {
  return version === Versions.V1_1 || version === Versions.V1_2;
}

export function isV3 (version: string): boolean {
  return version === Versions.V1_0_bloxberg;
}

// export function isBloxberg (version: string): boolean {
//   return version === Versions.V1_0_bloxberg;
// }

export default Versions;
