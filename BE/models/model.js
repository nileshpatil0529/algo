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
const niftySchema = genericModel;
const bankNiftySchema = genericModel;
const expStrikeList = genericModel;

const NiftyData = mongoose.model('NiftyData', niftySchema);
const BankNiftyData = mongoose.model('BankNiftyData', bankNiftySchema);
const ExpStrike = mongoose.model('ExpStrike', expStrikeList);

// Alert Model
const alertData = genericModel;
const AlertData = mongoose.model('AlertData', alertData);

export { NiftyData, BankNiftyData, AlertData, ExpStrike };
