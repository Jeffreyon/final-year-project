module.exports.controller = (app) => {
    // get homepage
    app.get('/', (req, res) => {
        res.render('index');
    })
    app.get('/about', (req, res) => {
        res.render('pages/about');
    })
    app.get('/contact(-us)?', (req, res) => {
        res.render('pages/contact-us');
    })
}