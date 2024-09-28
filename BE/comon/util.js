import moment from 'moment-timezone';
import mongoose from 'mongoose';

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
