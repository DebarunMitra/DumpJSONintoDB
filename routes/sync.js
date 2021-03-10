const express = require('express');
const axios = require("axios");

const router = express.Router();

router.get("/courses", async (req, res) => {
    try{
        const CourseData = await axios.get("http://localhost:5010/dump/api/v1/courses").then(course=>course.data);
        CourseData.map(async course => {
            let dbCourseData = await axios.get(`http://localhost:5010/dump/api/v1/courses/${course.CourseId}`).then(dbCourse=>dbCourse.data).catch(err=> false);
            if(dbCourseData){
                //  console.log(`${course.Skills}: ${dbCourseData.skills}`);
                if(
                    course.Title !== dbCourseData.title ||
                    course.Description !== dbCourseData.description ||
                    course.Skills !== dbCourseData.skills
                ){
                    axios.put(`http://localhost:5010/dump/api/v1/courses/${course.CourseId}`, {
                        "Title": course.Title,
                        "Description": course.Description,
                        "Skills": course.Skills
                    }).then(updatedCourse=>{
                        if(updatedCourse.status === 200 && updatedCourse.data === "Course Updated"){
                            console.log(`${course.CourseId}: Course Updated Successfully`);
                        }
                    })
                }else{
                    console.log(`${course.CourseId}: Course Checked Successfully`);
                }
            }else{
                axios.post('http://localhost:5010/dump/api/v1/courses', {
                    "Title": course.Title,
                    "Description": course.Description,
                    "Skills": course.Skills,
                    "CourseId": course.CourseId
                }).then(newDbCourse=>{
                    if(newDbCourse.data.id!==undefined){
                        console.log(`${course.CourseId}: New Course Created`);
                    }
                });
            }
        })
        res.status(200).json(CourseData);
    }catch (err) {
        console.log(err.message);
      }
})

module.exports = router;