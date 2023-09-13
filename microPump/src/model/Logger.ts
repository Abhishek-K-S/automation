import mongoose from 'mongoose';

const schema = new mongoose.Schema({
    requestId: {
        required: true,
        type: String,
    },
    action: {
        required: true,
        type: String
    },
    outcome: String,
    isError: Boolean
}, {timestamps: true})

const logger = mongoose.model('Logger', schema);

export default logger