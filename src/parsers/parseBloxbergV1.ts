import { Decoder } from '@vaultie/lds-merkle-proof-2019';
import { CERTIFICATE_VERSIONS } from '../constants';
import domain from '../domain';
import { BloxbergV1 } from '../models/BloxbergV1';

function parseSignature (signature): any { // TODO: define v3 signature type
  const base58Decoder = new Decoder(signature.proofValue);
  return base58Decoder.decode();
}

function getRecipientFullName (certificateJson): string {
  const { credentialSubject } = certificateJson;
  return credentialSubject.name;
}

function getRecipientSubjectID (certificateJson): string {
  const { credentialSubject } = certificateJson;
  return credentialSubject.id;
}

async function getIssuerProfile (issuer): Promise<any> { // TODO: define issuer profile
  const profile = await domain.verifier.getIssuerProfile(issuer);
  return profile;
}

export default async function parseBloxbergV1 (certificateJson): Promise<BloxbergV1> {
  const receipt = parseSignature(certificateJson.proof);
  const { issuer: issuerProfileUrl, metadataJson, issuanceDate, id, expirationDate } = certificateJson;
  const issuer = await getIssuerProfile(issuerProfileUrl);
  return {
    chain: domain.certificates.getChain('', receipt),
    expires: expirationDate,
    issuedOn: issuanceDate,
    id,
    issuer,
    metadataJson,
    receipt,
    recipientFullName: getRecipientFullName(certificateJson),
    recordLink: getRecipientSubjectID(certificateJson),
    version: CERTIFICATE_VERSIONS.V1_0_bloxberg
  };
}
