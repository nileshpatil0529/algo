import { AlertData } from '../models/model.js';

export const alertWebhook = async (req, res) => {
  try {
    const alertData = req.body;
    const newAlert = new AlertData(alertData);
    await newAlert.save();
    res.status(200).send('Alert received');
  } catch (error) {
    console.error('Error processing alert:', error);
    res.status(500).send('Error processing alert');
  }
};

export const getAlertIndicatorList = async (req, res) => {
  try {
    const orders = await AlertData.find();
    const uniqueIndicators = [...new Set(orders.map((order) => order.indicator))];
    res.json({ indicators: uniqueIndicators });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

export const getAlertData = async (req, res) => {
  const { indicator } = req.body;
  let orders = '';

  try {
    if (!indicator) {
      orders = await AlertData.find();
    } else {
      orders = await AlertData.find({ indicator: indicator });
    }
    res.json({ orders });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};
