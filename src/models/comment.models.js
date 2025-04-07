import mongoose, { model } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const commentSchema = new mongoose.Schema({
    
    comtent: {
        type: String,
        require: true,
    },
    video: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video"
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }

}, {timeseries: true})

commentSchema.plugin(mongooseAggregatePaginate)

export const Comment = mongoose.model("Comment", commentSchema)