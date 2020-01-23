import { CERTIFICATE_VERSIONS } from './constants';
import domain from './domain';
import { SignatureImage } from './models';

/**
 * _getSignatureImages
 *
 * @param signatureRawObject
 * @param certificateVersion
 * @returns {Array}
 * @private
 */
function getSignatureImages (signatureRawObject, certificateVersion) {
  let signatureImageObjects = [];

  switch (certificateVersion) {
    case CERTIFICATE_VERSIONS.V1_1:
    case CERTIFICATE_VERSIONS.V1_2:
      if (signatureRawObject.constructor === Array) {
        for (let index in signatureRawObject) {
          let signatureLine = signatureRawObject[index];
          let jobTitle = 'jobTitle' in signatureLine ? signatureLine.jobTitle : null;
          let signerName = 'name' in signatureLine ? signatureLine.name : null;
          let signatureObject = new SignatureImage(signatureLine.image, jobTitle, signerName);
          signatureImageObjects.push(signatureObject);
        }
      } else {
        let signatureObject = new SignatureImage(signatureRawObject, null, null);
        signatureImageObjects.push(signatureObject);
      }
      break;

    case CERTIFICATE_VERSIONS.V2_0:
      for (let index in signatureRawObject) {
        let signatureLine = signatureRawObject[index];
        let signatureObject = new SignatureImage(signatureLine.image, signatureLine.jobTitle, signatureLine.name);
        signatureImageObjects.push(signatureObject);
      }
      break;
  }

  return signatureImageObjects;
}

/**
 * parseV1
 *
 * @param certificateJson
 * @returns {Certificate}
 */
function parseV1 (certificateJson) {
  const fullCertificateObject = certificateJson.certificate || certificateJson.document.certificate;
  const recipient = certificateJson.recipient || certificateJson.document.recipient;
  const assertion = certificateJson.document.assertion;

  const receipt = certificateJson.receipt;
  const version = typeof receipt === 'undefined' ? CERTIFICATE_VERSIONS.V1_1 : CERTIFICATE_VERSIONS.V1_2;

  let { image: certificateImage, description, issuer, subtitle } = fullCertificateObject;

  const publicKey = recipient.publicKey;
  const chain = domain.certificates.getChain(publicKey);
  const expires = assertion.expires;
  const id = assertion.uid;
  const issuedOn = assertion.issuedOn;
  const metadataJson = assertion.metadataJson;
  const recipientFullName = `${recipient.givenName} ${recipient.familyName}`;
  const recordLink = assertion.id;
  const revocationKey = recipient.revocationKey || null;
  const sealImage = issuer.image;
  const signature = certificateJson.document.signature;
  const signaturesRaw = certificateJson.document && certificateJson.document.assertion && certificateJson.document.assertion['image:signature'];
  const signatureImage = getSignatureImages(signaturesRaw, version);
  if (typeof subtitle === 'object') {
    subtitle = subtitle.display ? subtitle.content : '';
  }
  let name = fullCertificateObject.title || fullCertificateObject.name;

  return {
    certificateImage,
    chain,
    description,
    expires,
    id,
    issuedOn,
    issuer,
    metadataJson,
    name,
    publicKey,
    receipt,
    recipientFullName,
    recordLink,
    revocationKey,
    sealImage,
    signature,
    signatureImage,
    subtitle,
    version
  };
}

/**
 * parseV2
 *
 * @param certificateJson
 * @returns {Certificate}
 */
function parseV2 (certificateJson) {
  const { id, expires, signature: receipt, badge } = certificateJson;
  const { image: certificateImage, name, description, subtitle, issuer } = badge;
  const issuerKey = certificateJson.verification.publicKey || certificateJson.verification.creator;
  const recipientProfile = certificateJson.recipientProfile || certificateJson.recipient.recipientProfile;

  const version = CERTIFICATE_VERSIONS.V2_0;
  const chain = domain.certificates.getChain(issuerKey, certificateJson.signature);
  const issuedOn = certificateJson.issuedOn;
  const metadataJson = certificateJson.metadataJson;
  const publicKey = recipientProfile.publicKey;
  const recipientFullName = recipientProfile.name;
  const recordLink = certificateJson.id;
  const revocationKey = null;
  const sealImage = issuer.image;
  const signatureImage = getSignatureImages(badge.signatureLines, version);

  return {
    certificateImage,
    chain,
    description,
    expires,
    id,
    issuedOn,
    issuer,
    metadataJson,
    name,
    publicKey,
    receipt,
    recipientFullName,
    recordLink,
    revocationKey,
    sealImage,
    signature: null,
    signatureImage,
    subtitle,
    version
  };
}

function parseV3 (certificateJson) {
  return {
    version: CERTIFICATE_VERSIONS.V3_0_alpha
  };
}

/**
 *
 * @param array: string[]
 * @param v: string
 * @returns boolean
 */
function lookupVersion (array, v) {
  return array.some(str => str.indexOf(`v${v}`) > -1 || str.indexOf(`${v}.`) > -1);
}

/**
 *
 * @param context: string | Context[]
 * @returns {string}
 */

function retrieveBlockcertsVersion (context) {
  if (typeof context === 'string') {
    context = [context];
  }

  const blockcertsContext = context.filter(ctx => typeof ctx === 'string').find(ctx => ctx.toLowerCase().indexOf('blockcerts') > 0);
  const blockcertsContextArray = blockcertsContext.split('/').filter(str => str !== '');

  const availableVersions = ['3', '2', '1'];

  return availableVersions.filter(version => lookupVersion(blockcertsContextArray, version))[0];
}

/**
 * parseJson
 *
 * @param certificateJson
 * @returns {*}
 */
export default function parseJSON (certificateJson) {
  const versionParserMap = {
    '1': parseV1,
    '2': parseV2,
    '3': parseV3
  };
  try {
    const version = retrieveBlockcertsVersion(certificateJson['@context']);
    const parsedCertificate = versionParserMap[version](certificateJson);
    parsedCertificate.isFormatValid = true;
    return parsedCertificate;
  } catch (err) {
    return {
      isFormatValid: false
    };
  }
}
