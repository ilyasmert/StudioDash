const Studio = require('./models/studio');
const Review = require('./models/review');
const { studioSchema, reviewSchema } = require('./schemas.js');
const ExpressError = require('./utils/ExpressError');

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'you must be logged in...');
        return res.redirect('/login');
    }
    next();
}

module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

module.exports.currentPage = (req, res, next) => { //added by me to continue from the same page after login...
    req.session.returnTo = req.originalUrl;
    return next();
}

module.exports.validateStudio = (req, res, next) => {
    const { error } = studioSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const studio = await Studio.findById(id);
    if (!studio.author.equals(req.user._id)) {
        req.flash('error', 'you do not have permission to do that...');
        return res.redirect(`/studios/${id}`);
    }
    next();
}

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'you do not have permission to do that...');
        return res.redirect(`/studios/${id}`);
    }
    next();
}

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}