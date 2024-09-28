import { getCurrentIstTime } from '../comon/util.js';
import { NiftyData, BankNiftyData, ExpStrike } from '../models/model.js';

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
