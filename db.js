const mongoose = require('mongoose');

const uri = 'mongodb+srv://kberhane88:baller88@cluster0.frysfzm.mongodb.net/dog-adoption';

module.exports = {
  connectToDb: (cb) => {
    mongoose.connect(uri)
      .then(() => {
        console.log('Connected to MongoDB via Mongoose');
        cb(null); // Explicitly pass null indicating NO error occurred
      })
      .catch(err => {
        console.error('Error connecting to MongoDB', err);
        cb(err); // Pass the error if it fails
      });
  },
 
  getDb: () => mongoose.connection // Return the Mongoose connection object for use in other parts of the app
};
