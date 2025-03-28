import multer from 'multer';
import express from 'express';
import { DropboxAuthentication, Test, Upload } from '../Controllers/CloudStorageControllers.js';

const cloudRouter = express.Router()

// Set up multer for file uploads
const upload = multer({
    dest: (req, file, cb) => {
        cb(null, 'uploads'); // Directory where files will be stored
    }
});
cloudRouter.post('/upload', upload.single('file'), Upload)
cloudRouter.post('/dropbox-auth', DropboxAuthentication)
cloudRouter.post('/tst', Test)

export default cloudRouter