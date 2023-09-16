const Studio = require('../models/studio');
const Review = require('../models/review.js');

module.exports.createReview = async (req, res) => {
    const studio = await Studio.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    studio.reviews.push(review);
    await review.save();
    await studio.save();
    req.flash('success', 'Created new review...');
    res.redirect(`/studios/${studio._id}`);
}

module.exports.deleteReview = async (req, res) => {
    await Studio.findByIdAndUpdate(req.params.id, { $pull: { reviews: req.params.reviewId } });
    await Review.findByIdAndDelete(req.params.reviewId);
    req.flash('success', 'Deleted the review...');
    res.redirect(`/studios/${req.params.id}`);
}