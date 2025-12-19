const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

app.get('/admin', (req, res) => {
    res.redirect('/admin/login.html');
});

app.use('/admin', express.static('admin'));

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function(req, file, cb) {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1000) + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: function(req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if(extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

const projectsRouter = require('./routes/projects');
const clientsRouter = require('./routes/clients');
const contactRouter = require('./routes/contact');
const newsletterRouter = require('./routes/newsletter');
const authRouter = require('./routes/auth');

app.use('/api/admin', authRouter);
app.use('/api/projects', projectsRouter(upload));
app.use('/api/clients', clientsRouter(upload));
app.use('/api/contact', contactRouter);
app.use('/api/newsletter', newsletterRouter);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: err.message || 'Something went wrong',
        code: 'SERVER_ERROR'
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
