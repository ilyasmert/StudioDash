const express = require('express');
const router = express.Router();
const { studioSchema } = require('../schemas.js');
const studios = require('../controllers/studios.js');
const catchAsync = require('../utils/catchAsync.js');
const { isLoggedIn, validateStudio, isAuthor, currentPage } = require('../middleware.js');
const multer = require('multer');
const { storage } = require('../cloudinary/index.js');
const upload = multer({ storage });

router.route('/')
    .get(catchAsync(studios.index))
    .post(isLoggedIn, upload.array('image'), validateStudio, catchAsync(studios.createStudio));

router.get('/new', isLoggedIn, studios.renderNewForm);

router.route('/:id')
    .get(currentPage, catchAsync(studios.showStudio))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateStudio, catchAsync(studios.editStudio))
    .delete(isLoggedIn, isAuthor, catchAsync(studios.deleteStudio));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(studios.renderEditForm));

module.exports = router;