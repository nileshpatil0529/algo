import mongoose from 'mongoose';

export const genericModel = new mongoose.Schema(
  {
    createdAt: {
      type: Date,
      default: () => {
        const now = new Date();
        const istOffset = 5.5 * 60 * 60 * 1000;
        return new Date(now.getTime() + istOffset);
      },
    },
  },
  { strict: false }
);

// Option-chain model
const optionNiftySchema = genericModel;
const optionBankNiftySchema = genericModel;
const optionExpStrikeList = genericModel;

const optionNiftyData = mongoose.model('optionNifty', optionNiftySchema);
const optionBankNiftyData = mongoose.model('optionBanknifty', optionBankNiftySchema);
const optionExpStrike = mongoose.model('optionExpStrike', optionExpStrikeList);

// Option-chain model
const futureNiftySchema = genericModel;
const futureBankNiftySchema = genericModel;
const futureExpStrikeList = genericModel;

const futureNiftyData = mongoose.model('futureNifty', futureNiftySchema);
const futureBankNiftyData = mongoose.model('futureBankNifty', futureBankNiftySchema);
// const futureExpStrike = mongoose.model('futureExpStrike', futureExpStrikeList);

// Alert Model
const alertData = genericModel;

const AlertData = mongoose.model('AlertData', alertData);

export { optionNiftyData, optionBankNiftyData, optionExpStrike, futureNiftyData, futureBankNiftyData, AlertData };
