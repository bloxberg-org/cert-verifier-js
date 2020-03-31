import { Decoder } from '@vaultie/lds-merkle-proof-2019';
import { CERTIFICATE_VERSIONS } from '../constants';
import domain from '../domain';

function parseSignature (signature) {
  const base58Decoder = new Decoder(signature.proofValue);
  return base58Decoder.decode();
}

export default function parseV3 (certificateJson) {
  const receipt = parseSignature(certificateJson.proof);
  const { issuer, metadataJson, issuanceDate } = certificateJson;
  return {
    chain: domain.certificates.getChain('', receipt),
    issuedOn: issuanceDate,
    issuer,
    metadataJson,
    receipt,
    version: CERTIFICATE_VERSIONS.V3_0_alpha
  };
}
