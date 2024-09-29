import { getCurrentIstTime } from '../comon/util.js';
import { optionNiftyData, optionBankNiftyData, optionExpStrike } from '../models/model.js';

export const clearDB = async () => {
  const lastBankNiftyData = await optionBankNiftyData.findOne().sort({ _id: -1 });
  const lastNiftyData = await optionNiftyData.findOne().sort({ _id: -1 });

  if (lastBankNiftyData && lastNiftyData) {
    lastNiftyData['createdAt'] = getCurrentIstTime();
    lastBankNiftyData['createdAt'] = getCurrentIstTime();

    await optionExpStrike.collection.drop();
    await optionBankNiftyData.collection.drop();
    await optionNiftyData.collection.drop();

    await optionBankNiftyData.insertMany(lastBankNiftyData);
    await optionNiftyData.insertMany(lastNiftyData);
  } else {
    console.log('No data found to delete and reinsert.');
  }
};
