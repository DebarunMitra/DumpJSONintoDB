const { log } = require('console');
const express = require('express');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const dbPool = require("../config/db");

const router = express.Router();

const CourseJSON = JSON.parse(fs.readFileSync(`courses.json`));

//Courses From JSON
router.get("/courses", (req, res) => {
    res.status(200).json(CourseJSON);
});

//create new course in db
router.post("/courses", async(req, res)=>{
    try {
         const {Title, Description, Skills, CourseId} = req.body;
         const newCourse = await dbPool.query("INSERT INTO courses (id, title, description, skills, course_id) VALUES($1,$2,$3,$4,$5) RETURNING *", [uuidv4(), Title, Description, Skills, CourseId]);
         console.log("Course Created Successfully");
         res.status(201).json(newCourse.rows[0]);
    } catch (error) {
        console.error(error.message);
    }
});

//create new course in db
router.post("/courses", async(req, res)=>{
    try {
         const {Title, Description, Skills, CourseId} = req.body;
         const newCourse = await dbPool.query("INSERT INTO courses (id, title, description, skills, course_id) VALUES($1,$2,$3,$4,$5) RETURNING *", [uuidv4(), Title, Description, Skills, CourseId]);
         console.log("Course Created Successfully");
         res.status(201).json(newCourse.rows[0]);
    } catch (error) {
        console.error(error.message);
    }
});

//update db course by id
router.put("/courses/:cid", async (req, res) => {
    try {
      const { cid } = req.params;
      const {Title, Description, Skills} = req.body;
      const updateCourse = await dbPool.query(
        "UPDATE courses SET title = $1,description = $2,skills=$3 WHERE course_id = $4",
          [Title, Description, Skills, cid]
      );
  
      res.status(200).json("Course Updated");
    } catch (err) {
      console.error(err.message);
    }
  });
  

  //delete course by id
router.delete("/courses/:cid", async (req, res) => {
    try {
        const { cid } = req.params;
      const deleteTodo = await dbPool.query("DELETE FROM courses WHERE course_id = $1", [
        cid,
      ]);
      res.status(200).json("Course Deleted");
    } catch (err) {
      console.log(err.message);
    }
  });

module.exports = router;