import { Certificate, STEPS, SUB_STEPS, VERIFICATION_STATUSES } from '../../../src';
import sinon from 'sinon';
import * as Explorers from '../../../src/explorers/explorer';
import FIXTURES from '../../fixtures';
import domain from '../../../src/domain';
import etherscanApiWithKey from '../../data/etherscan-key';

describe('Certificate test suite', function () {
  describe('verify method', function () {
    describe('given it is called with a Bloxberg v1', function () {
      describe('when the certificate is valid', function () {
        let certificate;

        beforeEach(async function () {
          sinon.stub(Explorers, 'getTransactionFromApi').resolves({
            remoteHash: '152984bfbe401800ef55b3e6cbf275a5e5996e1b869c66cd672c6ae494ffc5b5',
            issuingAddress: '0xD748BF41264b906093460923169643f45BDbC32e',
            time: '2021-04-06T12:05:50.247276',
            revokedAddresses: []
          });
          certificate = new Certificate(FIXTURES.BlockcertsBloxberg);
          await certificate.init();
        });

        afterEach(function () {
          certificate = null;
          sinon.restore();
        });

        it('should call it with the step, the text and the status', async function () {
          const callbackSpy = sinon.spy();
          const assertionStep = {
            code: SUB_STEPS.getTransactionId,
            label: SUB_STEPS.language.getTransactionId.labelPending,
            status: VERIFICATION_STATUSES.SUCCESS
          };

          await certificate.verify(callbackSpy);
          expect(callbackSpy.calledWith(sinon.match(assertionStep))).toBe(true);
        });

        it('should return the success finalStep', async function () {
          const successMessage = domain.i18n.getText('success', 'blockchain');
          const expectedFinalStep = {
            code: STEPS.final,
            status: VERIFICATION_STATUSES.SUCCESS,
            message: successMessage
          };

          const finalStep = await certificate.verify();
          expect(finalStep).toEqual(expectedFinalStep);
        });
      });

    });

    describe('given it is called with a Blockcerts v3 with custom contexts', function () {
      describe('when the certificate is valid', function () {
        let certificate;

        beforeEach(async function () {
          sinon.stub(Explorers, 'getTransactionFromApi').resolves({
            remoteHash: '152984bfbe401800ef55b3e6cbf275a5e5996e1b869c66cd672c6ae494ffc5b5',
            issuingAddress: '0xD748BF41264b906093460923169643f45BDbC32e',
            time: '2021-04-06T12:05:50.247276',
            revokedAddresses: []
          });
          certificate = new Certificate(FIXTURES.BlockcertsBloxberg, { explorerAPIs: [etherscanApiWithKey] });
          await certificate.init();
        });

        afterEach(function () {
          sinon.restore();
          certificate = null;
        });

        it('should call it with the step, the text and the status', async function () {
          const callbackSpy = sinon.spy();
          const assertionStep = {
            code: SUB_STEPS.getTransactionId,
            label: SUB_STEPS.language.getTransactionId.labelPending,
            status: VERIFICATION_STATUSES.SUCCESS
          };

          await certificate.verify(callbackSpy);
          expect(callbackSpy.calledWith(sinon.match(assertionStep))).toBe(true);
        });

        it('should return the success finalStep', async function () {
          const successMessage = domain.i18n.getText('success', 'blockchain');
          const expectedFinalStep = {
            code: STEPS.final,
            status: VERIFICATION_STATUSES.SUCCESS,
            message: successMessage
          };

          const finalStep = await certificate.verify();
          expect(finalStep).toEqual(expectedFinalStep);
        });
      });
    });
  });
});
