import moment from 'moment-timezone';
import { NiftyData, BankNiftyData } from '../models/model.js';

export const api_Model_collections = [
  { url: 'https://www.nseindia.com/api/option-chain-indices?symbol=NIFTY', model: NiftyData, name: 'NIFTY' },
  { url: 'https://www.nseindia.com/api/option-chain-indices?symbol=BANKNIFTY', model: BankNiftyData, name: 'BankNifty' },
];

export const ApiHeaders = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
  'Accept-Language': 'en-US,en;q=0.9',
};

export const getCurrentIstTime = () => {
  const currentTime = new Date();
  const offset = 5.5 * 60 * 60 * 1000;
  return new Date(currentTime.getTime() + offset).toISOString();
};

export const createNewDate = (inputTime) => {
  const dateString = moment().tz('Asia/Kolkata').format('YYYY-MM-DD') + 'T00:00:00.000Z';
  const [hours, minutes] = inputTime.split(':').map(Number);
  const date = new Date(dateString);
  date.setUTCHours(hours, minutes, 0, 0);
  return date.toISOString();
};
