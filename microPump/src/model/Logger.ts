import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate'

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

schema.plugin(mongoosePaginate);

const logger = mongoose.model('Logger', schema);

export default logger