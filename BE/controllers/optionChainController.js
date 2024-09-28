import { createNewDate } from '../comon/util.js';
import { NiftyData, BankNiftyData, ExpStrike } from '../models/model.js';

export const getExpiryStrikeList = async (req, res) => {
  const { exchange } = req.body;

  try {
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

export const getOptionChainData = async (req, res) => {
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
