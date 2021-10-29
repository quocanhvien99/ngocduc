const express = require('express');
const router = express.Router();
const pictures = require('../controllers/pictures');
const catchAsync = require('../utils/catchAsync');
const { pictureSchema } = require('../schemas.js');
const ExpressError = require('../utils/ExpressError');
const Picture = require('../models/picture');
const { isLoggedIn, isAuthor,validatePicture } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });
const Fuse = require('fuse.js');

// const validatePicture = (req, res, next) => {
//     const { error } = pictureSchema.validate(req.body);
//     if (error) {
//         const msg = error.details.map(el => el.message).join(',')
//         throw new ExpressError(msg, 400)
//     } else {
//         next();
//     }
// }

// module.exports.isAuthor = async (req, res, next) => {
//     const { id } = req.params;
//     const picture = await Picture.findById(id);
//     if (!picture.author.equals(req.user._id)) {
//         req.flash('error', 'You do not have permission to do that!');
//         return res.redirect(`/pictures/${id}`);
//     }
//     next();
// }

router.route('/')
    .get(catchAsync(pictures.index))
    .post(isLoggedIn, upload.array('image'), validatePicture, catchAsync(pictures.createPicture));
//   .post(upload.array('image'), (req, res) => {
//       console.log(req.body, req.files);
//       res.send("It Worked")
//   })

router.get('/new', isLoggedIn, pictures.renderNewForm)


// router.post('/', isLoggedIn,validatePicture, catchAsync(pictures.createPicture));

router.route('/:id')
    .get(catchAsync(pictures.showPicture))
    .put(isLoggedIn, isAuthor,upload.array('image'), validatePicture, catchAsync(pictures.updatePicture))
    .delete(isLoggedIn, isAuthor, catchAsync(pictures.deletePicture));

router.get('/:id/edit', isLoggedIn, catchAsync(pictures.renderEditForm))


module.exports = router;