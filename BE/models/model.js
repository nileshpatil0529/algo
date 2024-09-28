import mongoose from 'mongoose';
import { genericModel } from '../comon/util.js';

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
