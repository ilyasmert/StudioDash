const Studio = require('../models/studio');
const { cloudinary } = require('../cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = async (req, res) => {
    const studios = await Studio.find({});
    res.render('studios/index', { studios });
}

module.exports.renderNewForm = (req, res) => {
    res.render('studios/new');
}

module.exports.createStudio = async (req, res, next) => {
    //if (!req.body.studio) throw new ExpressError('Invalid Studio Data...', 404);
    const geoData = await geocoder.forwardGeocode({
        query: req.body.studio.location,
        limit: 1
    }).send();
    const studio = new Studio(req.body.studio);
    studio.geometry = geoData.body.features[0].geometry;
    studio.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    studio.author = req.user._id;
    await studio.save();
    req.flash('success', 'Successfully made a new studio!');
    res.redirect(`/studios/${studio._id}`);
}

module.exports.showStudio = async (req, res) => {
    const studio = await Studio.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!studio) {
        req.flash('error', 'Cannot find that studio...');
        return res.redirect('/studios');
    };
    res.render('studios/show', { studio });
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const studio = await Studio.findById(id);
    if (!studio) {
        req.flash('error', 'Cannot find that studio...');
        return res.redirect('/studios');
    }
    res.render('studios/edit', { studio });
}

module.exports.editStudio = async (req, res) => {
    const { id } = req.params;
    const geoData = await geocoder.forwardGeocode({
        query: req.body.studio.location,
        limit: 1
    }).send();
    const studio = await Studio.findByIdAndUpdate(id, req.body.studio, { runValidators: true, new: true });
    studio.geometry = geoData.body.features[0].geometry;
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    studio.images.push(...imgs);
    await studio.save()
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await studio.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
    }
    req.flash('success', 'Sucessfully updated studio...');
    res.redirect(`/studios/${studio._id}`);
}

module.exports.deleteStudio = async (req, res) => {
    const { id } = req.params;
    await Studio.findByIdAndDelete(id);
    req.flash('success', 'Deleted the studio...');
    res.redirect('/studios');
}