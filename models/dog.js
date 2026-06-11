const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dogSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    adopted: {
        type: Boolean,
        default: false
    },
    adoptedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    registeredBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    }
});

const Dog = mongoose.model('Dog', dogSchema);
module.exports = Dog;