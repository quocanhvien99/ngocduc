const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const users = require('../controllers/users');
const { isLoggedIn, isAuthor,validatePicture,isAuthorProfile } = require('../middleware');


router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.register));

router.route('/login')
    .get(users.renderLogin)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login)

router.get('/logout', users.logout);
router.get('/users/:id', catchAsync(async (req, res,) => {
    const user = await User.findById(req.params.id);
  
    res.render('users/show', { user });
}));

router.get('/users/:id/edit', catchAsync(async (req, res) => {
    const user = await User.findById(req.params.id) 
    // res.render('users/edit', { user });
    if (!user) {
        req.flash('error', 'Cannot find that user!');
    }
    res.render('users/edit', { user });

}));

router.put('/users/:id',isAuthorProfile ,  catchAsync(async (req, res) => {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(id, { ...req.body.user });
    req.flash('success', 'Successfully updated profile!');
    res.redirect(`/users/${user_id}`)
}));

module.exports = router;

