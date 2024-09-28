import fetch from 'node-fetch';
import moment from 'moment-timezone';

import { NiftyData, BankNiftyData, AlertData, ExpStrike } from '../models/optionChainModel.js';

const selectList = {};
const apis = [
  { url: 'https://www.nseindia.com/api/option-chain-indices?symbol=NIFTY', model: NiftyData, name: 'NIFTY' },
  { url: 'https://www.nseindia.com/api/option-chain-indices?symbol=BANKNIFTY', model: BankNiftyData, name: 'BankNifty' },
];
const headerArr = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
  'Accept-Language': 'en-US,en;q=0.9',
};

const getISTTime = () => {
  const currentTime = new Date();
  const offset = 5.5 * 60 * 60 * 1000;
  return new Date(currentTime.getTime() + offset).toISOString();
};

export const fetchNSEData = async () => {
  const fetchWithRetry = async (api, retries = 3, delay = 1000) => {
    try {
      const response = await fetch(api.url, { headers: headerArr });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      storeExpiryStrike(data);
      data.records.data.forEach((record) => {
        record.createdAt = getISTTime();
      });

      await api.model.create({ data: data.records.data });
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

function storeExpiryStrike(data) {
  const exchange = data.records.data[0].PE.underlying;
  const strikes = data.records.strikePrices;
  const expirys = data.records.expiryDates;
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
}

export const getExpiryStrike = async (req, res) => {
  const { exchange } = req.body;

  try {
    // Find the latest document in the collection
    const data = await ExpStrike.findOne().sort({ createdAt: -1 }).exec();

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

export const saveExpStrikes = async () => {
  try {
    const list = new ExpStrike(selectList);
    await list.save();
  } catch (error) {
    console.error('Error storing expStriks list:', error);
  }
};

export const geyTDalert = async (req, res) => {
  try {
    const alertData = req.body;
    const newAlert = new AlertData(alertData);
    await newAlert.save();
    res.status(200).send('Alert received');
  } catch (error) {
    console.error('Error processing alert:', error);
    res.status(500).send('Error processing alert');
  }
};

export const getAlertIndicatorList = async (req, res) => {
  try {
    // Fetch all documents from the collection
    const orders = await AlertData.find();

    // Extract unique indicators
    const uniqueIndicators = [...new Set(orders.map((order) => order.indicator))];

    // Send the unique indicators as a JSON response
    res.json({ indicators: uniqueIndicators });
  } catch (err) {
    // Handle errors
    console.error(err);
    res.status(500).send('Server error');
  }
};

export const getAlertData = async (req, res) => {
  const { indicator } = req.body;
  let orders = '';

  try {
    if (!indicator) {
      orders = await AlertData.find();
    } else {
      orders = await AlertData.find({ indicator: indicator });
    }
    res.json({ orders });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

export const getData = async (req, res) => {
  const { expiryDate, fromTime, toTime, strikePrice, exchange } = req.body;
  let model = '';

  if (exchange === 'NIFTY') {
    model = NiftyData;
  } else if (exchange === 'BANKNIFTY') {
    model = BankNiftyData;
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
      }
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

function createNewDate(inputTime) {
  const dateString = moment().tz('Asia/Kolkata').format('YYYY-MM-DD') + 'T00:00:00.000Z';
  const [hours, minutes] = inputTime.split(':').map(Number);
  const date = new Date(dateString);
  date.setUTCHours(hours, minutes, 0, 0);
  return date.toISOString();
}

export const clearDB = async () => {
  const lastBankNiftyData = await BankNiftyData.findOne().sort({ _id: -1 });
  const lastNiftyData = await NiftyData.findOne().sort({ _id: -1 });

  if (lastBankNiftyData && lastNiftyData) {
    lastNiftyData['createdAt'] = getISTTime();
    lastBankNiftyData['createdAt'] = getISTTime();

    await ExpStrike.collection.drop();
    await BankNiftyData.collection.drop();
    await NiftyData.collection.drop();

    await BankNiftyData.insertMany(lastBankNiftyData);
    await NiftyData.insertMany(lastNiftyData);
  } else {
    console.log('No data found to delete and reinsert.');
  }
};
