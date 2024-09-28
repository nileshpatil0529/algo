import { getCurrentIstTime } from '../comon/util.js';
import { NiftyData, BankNiftyData, ExpStrike } from '../models/model.js';

const apis = [
  { url: 'https://www.nseindia.com/api/option-chain-indices?symbol=NIFTY', model: NiftyData, name: 'NIFTY' },
  { url: 'https://www.nseindia.com/api/option-chain-indices?symbol=BANKNIFTY', model: BankNiftyData, name: 'BankNifty' },
];
const headerArr = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
  'Accept-Language': 'en-US,en;q=0.9',
};
const selectList = {};
let optionChainData;

export const storeOptionChainNSE = async () => {
  const fetchWithRetry = async (api, retries = 3, delay = 1000) => {
    try {
      const response = await fetch(api.url, { headers: headerArr });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      optionChainData = await response.json();
      //   storeExpiryStrike(optionChainData);
      optionChainData.records.data.forEach((record) => {
        record.createdAt = getCurrentIstTime();
      });

      await api.model.create({ data: optionChainData.records.data });
    } catch (error) {
      if (retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        return fetchWithRetry(api, retries - 1, delay * 2);
      } else {
        console.error(`Failed to fetch data from ${api.name} after multiple attempts:`, error);
      }
    }
  };

  try {
    const fetchPromises = apis.map((api) => fetchWithRetry(api));
    await Promise.all(fetchPromises);
  } catch (error) {
    console.error('Error fetching or storing data:', error);
  }
};

export const storeExpiryStrike = async () => {
  const exchange = optionChainData.records.data[0].PE.underlying;
  const strikes = optionChainData.records.strikePrices;
  const expirys = optionChainData.records.expiryDates;
  switch (exchange) {
    case 'NIFTY':
      selectList['nifty_expiryDates'] = expirys;
      selectList['nifty_strikes'] = strikes;
      break;
    case 'BANKNIFTY':
      selectList['banknifty_expiryDates'] = expirys;
      selectList['banknifty_strikes'] = strikes;
      break;
  }
  try {
    const list = new ExpStrike(selectList);
    await list.save();
  } catch (error) {
    console.error('Error storing expStriks list:', error);
  }
};

export const clearDB = async () => {
  const lastBankNiftyData = await BankNiftyData.findOne().sort({ _id: -1 });
  const lastNiftyData = await NiftyData.findOne().sort({ _id: -1 });

  if (lastBankNiftyData && lastNiftyData) {
    lastNiftyData['createdAt'] = getCurrentIstTime();
    lastBankNiftyData['createdAt'] = getCurrentIstTime();

    await ExpStrike.collection.drop();
    await BankNiftyData.collection.drop();
    await NiftyData.collection.drop();

    await BankNiftyData.insertMany(lastBankNiftyData);
    await NiftyData.insertMany(lastNiftyData);
  } else {
    console.log('No data found to delete and reinsert.');
  }
};
