const express = require('express');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

const CourseJSON = JSON.parse(fs.readFileSync(`courses.json`));

router.get("/courses", (req, res) => {
    res.status(200).json(CourseJSON);
})

module.exports = router;