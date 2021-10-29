const Picture = require('../models/picture');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require("../cloudinary");
const Fuse = require('fuse.js');


module.exports.index = async (req, res) => {
    var noMatch = null
    if(req.query.search){
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        const pictures = await Picture.find({$or : [
            {title: regex},
            {location: regex},
            {"author.username":regex}
       ]});
        {
        if(pictures.length < 1) {
           var noMatch = req.query.search;
           console.log("ko thay anh")
        }
        res.render("pictures/index",{pictures, noMatch});
     }
    
}
       
else {
    const pictures = await Picture.find({});
    res.render('pictures/index', { pictures,noMatch })
    }
}

module.exports.renderNewForm = (req, res) => {
    res.render('pictures/new');
}

module.exports.createPicture = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.picture.location,
        limit: 1
    }).send()
    const picture = new Picture(req.body.picture);
    picture.geometry = geoData.body.features[0].geometry;
    picture.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    picture.author = req.user._id;
    await picture.save();
    console.log(picture);
    req.flash('success', 'Successfully upload a new picture!');
    res.redirect(`/pictures/${picture._id}`)
}

module.exports.showPicture = async (req, res,) => {
    const picture = await Picture.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!picture) {
        req.flash('error', 'Cannot find that picture!');
        return res.redirect('/pictures');
    }
    res.render('pictures/show', { picture });
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const picture = await Picture.findById(id)
    if (!picture) {
        req.flash('error', 'Cannot find that picture!');
        return res.redirect('/pictures');
    }
    res.render('pictures/edit', { picture });
}

module.exports.updatePicture = async (req, res) => {
    const { id } = req.params;
    const picture = await Picture.findByIdAndUpdate(id, { ...req.body.picture });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    picture.images.push(...imgs);
    await picture.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await picture.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated picture!');
    res.redirect(`/pictures/${picture._id}`)
}

module.exports.deletePicture = async (req, res) => {
    const { id } = req.params;
    await Picture.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted picture')
    res.redirect('/pictures');
}
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};