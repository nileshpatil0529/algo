import cron from 'node-cron';
import moment from 'moment-timezone';
import { storeOptionChainNSE, storeExpiryStrike, clearDB } from './cron-helper.js';

export const cronRunner = () => {
  // Cron job for every minute from 9:15 AM IST to 3:30 PM IST (which is 11:45 AM SGT to 6:00 PM SGT)
  // cron.schedule('*/1 11-17 * * 1-5', () => {
  cron.schedule('*/1 9-15 * * 1-5', () => {
    const now = moment().tz('Asia/Kolkata');
    
    // Checking if within the desired time range (IST time)
    const isWithinTimeRange = now.isBetween(
      moment(now).hour(9).minute(15).second(0),
      moment(now).hour(15).minute(30).second(59)
    );

    // DB clearing condition (9:13 AM to 9:14 AM IST)
    const dbClear = now.isBetween(
      moment(now).hour(9).minute(13).second(0),
      moment(now).hour(9).minute(14).second(59)
    );

    // Expiry and Strike Price list runner (9:15 AM to 9:17 AM IST)
    const expStrikeRunner = now.isBetween(
      moment(now).hour(9).minute(15).second(0),
      moment(now).hour(9).minute(17).second(59)
    );

    // Data fetching task
    if (isWithinTimeRange) {
      storeOptionChainNSE();
      console.log('Data fetched and stored in MongoDB - ', now.format());
    }

    // Expiry and Strike Price list task
    if (expStrikeRunner) {
      storeExpiryStrike();
      console.log('Expiry and Strike Price list stored - ', now.format());
    }

    // DB clearing task
    if (dbClear) {
      clearDB();
      console.log('DB cleared at - ', now.format());
    }
  });

  // Cron job for 9:00 PM IST, which is 11:30 PM Singapore time
  // cron.schedule('30 23 * * 1-5', () => {
  cron.schedule('0 21 * * 1-5', () => {
    const now = moment().tz('Asia/Kolkata');
    storeOptionChainNSE();
    console.log('Scheduled task running at 9:00 PM on weekdays - ', now.format());
  });
};
