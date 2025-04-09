import mongoose from "mongoose";
import { Comment } from "../models/comment.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {

    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const comments = await Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        }
    ])

    console.log(comments);

    if(!comments) throw new ApiError(500, "Error: internal server during fetched comments!!!")

    return res.status(200). json(new ApiResponse(
        200,
        comments,
        "Comments fetched successfully>"
    ))

});

const addComment = asyncHandler(async (req, res) => {

    const { videoId } = req.params;
    const { content } = req.body;
    const user = req.user

    if([ videoId, content ].some(field => field?.trim() === "")) throw new ApiError(400, "Error: All fields required!!!");

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: user?._id
    })

    if(!comment) throw new ApiError(500, "Error: Something went wrong while posting the comment!!!");

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        comment,
        "Comment posted Successfully."
    ))

});

const updateComment = asyncHandler(async (req, res) => {

    const { commentId } = req.params;
    const { newContent } = req.body;

    if([ commentId, newContent ].some(field => field?.trim() === "")) throw new ApiError(400, "Error: All fields required");

    const comment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set: {
                content: newContent
            }
        },
        { new: true }
    )

    if(!comment) throw new ApiError(500, "Error: Something wrong while updating the comment!!! try again after some time.")

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        comment,
        "Comment Updated Successfully."
    ))
});

const deleteComment = asyncHandler(async (req, res) => {

    const { commentId } = req.params;
    if(!commentId) throw new ApiError(400, "Error: id required!!!");

    const isDeleted = await Comment.findByIdAndDelete(commentId)
    if(!isDeleted) throw new ApiError(500, "Error Internal server error while deleting the entry!!!");

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        "Comment deleted."
    ))

});

export { 
    getVideoComments, 
    addComment, 
    updateComment, 
    deleteComment 
};
