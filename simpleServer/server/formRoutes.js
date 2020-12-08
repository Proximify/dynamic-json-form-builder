const express = require('express');
const fs = require('fs');
const router = express.Router();

const formDataDir = __dirname + '/data/formData.json';
const formSchemaDir = __dirname + '/data/formSchema.json';

router.route('/').get((req, res, next) => {
    let formSchema = null, formData = null;
    try {
        if (fs.existsSync(formSchemaDir)) {
            formSchema = fs.readFileSync(formSchemaDir);
            if (fs.existsSync(formDataDir) && fs.readFileSync(formDataDir).length !== 0){
                formData = fs.readFileSync(formDataDir);
            }
            res.status(200).json({
                formSchema: JSON.parse(formSchema),
                formData: formData ? JSON.parse(formData) : null
            });
        }else {
            res.status(404).json({
                data: "form schema file not found"
            });
        }
    } catch (err) {
        res.status(500).json({
            data: "error occurs when get form schema and data"
        });
    }
});

router.route('/submit').post((req, res) => {
    try{
        if (!fs.existsSync(formDataDir)) {
            fs.writeFileSync(formDataDir,JSON.stringify(req.body));
            res.status(200).json({
                message: "form data created"
            })
        }else {
            fs.writeFileSync(formDataDir,JSON.stringify(req.body));
            res.status(200).json({
                message: "form data already exist, updated"
            })
        }
    }catch (err){
        console.log(err)
        res.status(500).json({
            message: "error occurs when create form data"
        })
    }
})

router.route('/submit').put((req, res) => {
    try{
        if (fs.existsSync(formDataDir)) {
            fs.writeFileSync(formDataDir,JSON.stringify(req.body));
            res.status(200).json({
                message: "form data were overridden"
            })
        }else {
            res.status(404).json({
                message: "form data file not found"
            })
        }
    }catch (err){
        console.log(err)
        res.status(500).json({
            message: "error occurs when override form data"
        })
    }
})

router.route('/submit').patch((req, res) => {
    try{
        if (fs.existsSync(formDataDir)) {
            fs.writeFileSync(formDataDir,JSON.stringify(req.body));
            res.status(200).json({
                message: "form data were updated"
            })
        }else {
            res.status(404).json({
                message: "form data file not found"
            })
        }
    }catch (err){
        console.log(err)
        res.status(500).json({
            message: "error occurs when update form data"
        })
    }
})

module.exports = router;
