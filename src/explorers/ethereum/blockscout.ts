import { ExplorerAPI } from '../../certificate';
import { ExplorerURLs } from '../../index';
import { TRANSACTION_APIS, TRANSACTION_ID_PLACEHOLDER } from '../../constants/api';
import { TransactionData } from '../../models/TransactionData';
import { dateToUnixTimestamp } from '../../helpers/date';
import { BLOCKCHAINS, CONFIG, SUB_STEPS } from '../../constants';
import { VerifierError } from '../../models';
import { stripHashPrefix } from '../utils/stripHashPrefix';
import { getText } from '../../domain/i18n/useCases';
import { prependHashPrefix } from '../utils/prependHashPrefix';
import InputDataDecoder from 'ethereum-input-data-decoder';
import { request } from '../../services/request';
import {SupportedChains} from "../../constants/blockchains";

const serviceURL: ExplorerURLs = {
  main: `https://blockexplorer.bloxberg.org/api/api?module=transaction&action=gettxinfo&txhash=${TRANSACTION_ID_PLACEHOLDER}`,
  test: `https://blockexplorer.bloxberg.org/api/api?module=transaction&action=gettxinfo&txhash=${TRANSACTION_ID_PLACEHOLDER}`
};

async function parsingFunction (jsonResponse): Promise<TransactionData> {
  const smartContractAddress = jsonResponse.result.to
  console.log("smartContractAddress: " + smartContractAddress)
  const smartContractLink = "https://blockexplorer.bloxberg.org/api/api?module=contract&action=getabi&address=" + smartContractAddress

//TBD: Best option is to call blockexplorer API and get the ABI. Importing for simplicity...
  async function getSmartContractABI (smartContractLink): Promise<any> {

    try {
      const response = await request({url: smartContractLink});
      const responseData = JSON.parse(response);
      console.log(responseData)
      const abiData = responseData.result;
      const abiDataJson = JSON.parse(abiData)
      console.log(abiDataJson)
      return abiDataJson
    }
    catch (err) {
      throw new VerifierError(SUB_STEPS.fetchRemoteHash, getText('errors', 'unableToGetRemoteHash'));
    }
  }

  function parseSmartContractData(abi, jsonResponse) {
    try {
      console.log(abi)
      const decoder = new InputDataDecoder(abi);
      const data = jsonResponse.result.input
      const result = decoder.decodeData(data);
      var remoteHash = result.inputs[2]
      console.log("remote: " + remoteHash)
    } catch (err) {
      console.log(err)
    }

    const time = jsonResponse.result.timeStamp

    let issuingAddress = jsonResponse.result.from;
    console.log(remoteHash)
    //const remoteHash = stripHashPrefix(jsonResponse.result.hash, BLOCKCHAINS.ethmain.prefixes);
    console.log("blockscout remote merkle root: " + remoteHash)
    issuingAddress = prependHashPrefix(issuingAddress, BLOCKCHAINS.ethmain.prefixes);
    const revokedAddresses = []
    console.log(issuingAddress)
    console.log(remoteHash)
    console.log(time)
    return {
      remoteHash,
      issuingAddress,
      time,
      revokedAddresses
    };
  }
  const abiResponse = await getSmartContractABI(smartContractLink);
  return parseSmartContractData(abiResponse, jsonResponse)
}

export const explorerApi: ExplorerAPI = {
  serviceURL,
  serviceName: TRANSACTION_APIS.blockscout,
  parsingFunction,
  priority: -1
};
