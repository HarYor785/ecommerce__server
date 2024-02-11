import mongoose, { Schema } from 'mongoose';
import validator from 'validator';

const locationSchema = new Schema({
    name: String,
    country: String,
    address: String,
    apartment: String,
    phone: String,
    city: String,
    state: String,
    zipCode: String,
});

const storeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: String,
    email: {
        type: String,
        unique: true,
        validate: {
        validator: validator.isEmail,
        message: '{VALUE} is not a valid email!',
        },
    },
    mobile: String,
    currency: String,
    timeZone: String,
    weight: String,
    dimensionUnit: String,
    address: locationSchema,
}, {
  timestamps: true, // Include timestamps for createdAt and updatedAt
});

// Set default values for certain fields
storeSchema.set('default', {
    currency: 'Naira',
    dimensionUnit: 'cm',
    weight: 'kg',
});

// Trim strings before saving to the database
storeSchema.pre('save', function (next) {
    // Trim all string fields
    Object.keys(this.schema.paths).forEach((key) => {
        if (this[key] && this[key].constructor === String) {
        this[key] = this[key].trim();
        }
    });
    next();
});

const Store = mongoose.model('Store', storeSchema);

export default Store;
