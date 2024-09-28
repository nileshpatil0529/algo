import mongoose from 'mongoose';

const genericModel = new mongoose.Schema(
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

const niftySchema = genericModel;
const bankNiftySchema = genericModel;
const alertData = genericModel;
const expStrikeList = genericModel;

const NiftyData = mongoose.model('NiftyData', niftySchema);
const BankNiftyData = mongoose.model('BankNiftyData', bankNiftySchema);
const AlertData = mongoose.model('AlertData', alertData);
const ExpStrike = mongoose.model('ExpStrike', expStrikeList);

export { NiftyData, BankNiftyData, AlertData, ExpStrike };
