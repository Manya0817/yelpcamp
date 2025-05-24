const User=require('../models/user');

module.exports.renderRegister=(req, res) => {
    res.render('users/register');
}
// filepath: c:\Users\hp\Desktop\YelpCamp\controllers\users.js
// Add this to your existing register function in the controller
module.exports.register = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        console.log("About to register user:", email, username);
        const registeredUser = await User.register(user, password);
        console.log("User registered successfully:", registeredUser);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Yelp Camp!');
            res.redirect('/campgrounds');
        });
    } catch (e) {
        console.error("Registration error:", e);
        req.flash('error', e.message);
        res.redirect('register');
    }
};

module.exports.renderLogin= (req, res) => {
    res.render('users/login');
}

module.exports.login=(req, res) => {
    req.flash('success', 'welcome back!');
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res) => {
    req.logout(function(err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
}