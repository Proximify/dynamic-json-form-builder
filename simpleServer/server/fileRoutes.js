const express = require('express');
const fs = require('fs');
const router = express.Router();
let multer = require("multer");

const uploadsDir = __dirname + '/uploads/';

const fileTypes = {
    "pdf": "application/pdf",
    "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "jpeg": "image/jpeg",
    "png": "image/png",
    "jpg": "image/jpeg"
}

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
});

const upload = multer({storage});

router.route('/').get((req, res, next) => {
    try {
        fs.readdir(uploadsDir, (err, files) => {
            // files.forEach(file => {
            //     console.log(file);
            // });
            res.status(200).json({
                data: files
            });
        });
    } catch (err) {
        res.status(500).json({
            data: "error occur when get file list"
        })
    }
});

router.route('/:fileName').get((req, res, next) => {
    const fileName = req.params.fileName;
    try {
        if (fs.existsSync(`${uploadsDir}${fileName}`)) {
            const ext = fileName.split('.').pop();
            // console.log("file exist", ext);
            const contentType = fileTypes[ext];
            if (!contentType) {
                res.status(500).json({
                    data: "file type not support"
                });
            } else {
                res.contentType(contentType);
                res.status(200).sendFile(__dirname + '/uploads/' + fileName);
            }
        } else {
            res.status(404).json({
                data: "file not found"
            })
        }
    } catch (err) {
        res.status(500).json({
            data: "error occur when get file"
        })
    }
});

router.route('/:fileName').delete((req, res, next) => {
    // console.log(req.params.fileName);
    const fileName = req.params.fileName;
    try {
        if (fs.existsSync(`${uploadsDir}${fileName}`)) {
            fs.unlinkSync(`${uploadsDir}${fileName}`);
            res.status(200).json({
                data: "file deleted"
            })
        } else {
            res.status(404).json({
                data: "file not found"
            })
        }
    } catch (err) {
        res.status(500).json({
            data: "error occur when delete file"
        })
    }
});

router.route('/').post((req, res, next) => {

    upload.array('files',5)(req,res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(500).json(err)
        } else if (err) {
            return res.status(500).json(err)
        }
        return res.status(200).send(req.files)

    })
});

module.exports = router;
