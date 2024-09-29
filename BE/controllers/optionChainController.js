import { createNewDate } from '../comon/util.js';
import { optionNiftyData, optionBankNiftyData, optionExpStrike } from '../models/model.js';
import { getCurrentIstTime, ApiHeaders, api_Model_collections } from '../comon/util.js';

const apis = api_Model_collections;
const headerArr = ApiHeaders;
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
        // storeExpiryStrike();
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
    const list = new optionExpStrike(selectList);
    await list.save();
  } catch (error) {
    console.error('Error storing expStriks list:', error);
  }
};

export const getExpiryStrikeList = async (req, res) => {
  const { exchange } = req.body;

  try {
    const data = await optionExpStrike.findOne().sort({ createdAt: -1 }).exec();

    if (!data) {
      return res.status(404).json({ error: 'No data found' });
    }

    if (exchange === 'NIFTY') {
      res.json({
        expiryDates: data.nifty_expiryDates,
        strikes: data.nifty_strikes,
      });
    } else if (exchange === 'BANKNIFTY') {
      res.json({
        expiryDates: data.banknifty_expiryDates,
        strikes: data.banknifty_strikes,
      });
    } else {
      res.status(400).json({ error: 'Invalid exchange provided' });
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getOptionChainData = async (req, res) => {
  const { expiryDate, fromTime, toTime, strikePrice, exchange } = req.body;
  let model = '';

  if (exchange === 'NIFTY') {
    model = optionNiftyData;
  } else if (exchange === 'BANKNIFTY') {
    model = optionBankNiftyData;
  }

  try {
    let condition = { $and: [] };
    let selectedFilter = {
      $match: {
        data: {
          $elemMatch: {},
        },
      },
    };

    let quiry = [
      selectedFilter,
      {
        $project: {
          createdAt: 1,
          data: {
            $filter: {
              input: '$data',
              as: 'item',
              cond: condition,
            },
          },
        },
      },
    ];

    if (fromTime && toTime) {
      const fromDateTime = createNewDate(fromTime);
      const toDateTime = createNewDate(toTime);
      selectedFilter['$match'].createdAt = {
        $gte: new Date(fromDateTime),
        $lte: new Date(toDateTime),
      };
    } else {
      quiry.push({ $sort: { _id: -1 } });
      quiry.push({ $limit: 1 });
    }

    if (expiryDate) {
      condition['$and'].push({ $eq: ['$$item.expiryDate', expiryDate] });
      selectedFilter['$match']['data']['$elemMatch'][`expiryDate`] = expiryDate;
    }
    if (+strikePrice) {
      condition['$and'].push({ $eq: ['$$item.strikePrice', +strikePrice] });
      selectedFilter['$match']['data']['$elemMatch'][`strikePrice`] = +strikePrice;
    }

    const records = await model.aggregate(quiry);
    res.json(records);
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: 'Internal server error' });
  }
};
