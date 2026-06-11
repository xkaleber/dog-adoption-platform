const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long']
    },
    registeredDogs: [{
        type: Schema.Types.ObjectId,
        ref: 'Dog'
    }],
    adoptedDogs: [{
        type: Schema.Types.ObjectId,
        ref: 'Dog'
    }]
});

userSchema.pre('save', async function () {
        const salt = await bcrypt.genSalt(); // Generate a salt for hashing
        this.password = await bcrypt.hash(this.password, salt);
});

userSchema.statics.login = async function (username, password) {
    const user = await this.findOne({ username });
    if (user) {
        const auth = await bcrypt.compare(password, user.password);
        if (auth) {
            return user;
        }
        throw Error('Incorrect password');
    }
    throw Error('Incorrect username');
};

const User = mongoose.model('User', userSchema);
module.exports = User;
