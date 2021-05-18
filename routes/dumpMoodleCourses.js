const express = require('express');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const axios = require("axios");

const router = express.Router();

const RULE_ENGINE_URL = 'http://localhost:8080';

clearHtmlTags = (html) => {
    return html.replace(/<\/?("[^"]*"|'[^']*'|[^>])*(>|$)/g, "");
}

getDBCoursesData = async () => {
    const Courses = await axios.get(`${RULE_ENGINE_URL}/api/v1/courses`);
    const CourseData = await Courses.data.filter(course=>course.moodleCourseId!==null);
    return CourseData;
}

getMoodleCoursesData = async () => {
    const MoodelCourses = await axios.get(`https://stage-lms.thecareerlabs.com/webservice/rest/server.php?wstoken=79f1cd9efdb4481101c2c6ecb14c27a2&moodlewsrestformat=json&wsfunction=core_course_get_courses`);
    const MoodelCourse = await MoodelCourses.data.filter(course => course.idnumber!=="");
    return MoodelCourse;
}

setNewCourseToDB = async moodleCourse => {
    const Payload = {
        "courseId": moodleCourse.idnumber,
        "name": moodleCourse.displayname,
        "shortName": moodleCourse.shortname,
        "description": await clearHtmlTags(moodleCourse.summary),
        "bannerURL": "https://mernlmsassets.s3.ap-south-1.amazonaws.com/BannerImages/mechine%20learning.png",
        "displayImageURL": "https://mernlmsassets.s3.ap-south-1.amazonaws.com/Thumbnails/Data%20Science%20-Thumbnail.png",
        "thumnailImageURL": "https://mernlmsassets.s3.ap-south-1.amazonaws.com/Thumbnails/mechine%20learning%20-Thumbnail.png",
        "courseLevel": null,
        "courseCategory": null,
        "introVideoURL": "https://player.vimeo.com/video/371358659",
        "webinarURL": null,
        "isClapp": false,
        "visibility": false,
        "moodleCourseId": moodleCourse.id,
        "moodleCategoryId": moodleCourse.categoryid,
        "moodleSkillLevel": moodleCourse.customfields[2].value
    }

    const NewCourseResponse = await axios.post(`${RULE_ENGINE_URL}/api/v1/courses`, Payload);
    if(NewCourseResponse.status === 201){
        console.log(`New Course Created ${NewCourseResponse.data.id}`);
        return NewCourseResponse.data.id;
    }else{
        console.log('Fail to create new course!!');
        return false;
    }
}

getMoodleCourseContent = async (courseId) => {
    const courseContent =  await axios.get(`https://stage-lms.thecareerlabs.com/webservice/rest/server.php?wstoken=79f1cd9efdb4481101c2c6ecb14c27a2&moodlewsrestformat=json&wsfunction=core_course_get_contents&courseid=${courseId}`);
    // console.log('1: '+ await courseContent.data.length);
    let courseContentData = await courseContent.data;
    courseContentData.shift();
    // console.log('2: '+courseContentData.length);
    // console.log(courseContentData);
    console.log('Content Data Fetched!!');
    return courseContentData; //remove first object from array
}

setNewCourseContents = async (content, courseId) =>{
    const Payload = {
            "primaryTitle": content.name,
            "totalTime": "",
            "moodleContentId": content.id
        };
    
    const NewContentResponse = await axios.post(`${RULE_ENGINE_URL}/api/v1/course-content/${courseId}`, Payload);
    if(NewContentResponse.status === 201){
        console.log(`New Content Created ${NewContentResponse.data.id}`);
        return NewContentResponse.data.id;
    }else{
        console.log('Fail to create new Content!!');
        return false;
    }
}

setNewCourseContentsSecondaryTitle = async (secondaryTitle, contentId) => {
    const Payload = {
               "title": secondaryTitle.name,
               "videoUrl": "",
               "time": "",
               "moodleModuleId": secondaryTitle.id
            };
    const NewSecondaryTitleResponse = await axios.post(`${RULE_ENGINE_URL}/api/v1/secondary-title/create/${contentId}`, Payload);
    if(NewSecondaryTitleResponse.status === 201){
        console.log(`New Secondary Title Created ${NewSecondaryTitleResponse.data.id}`);
        return true;
    }else{
        console.log('Fail to create new secondary title!!');
        return false;
    }
}

updateDbCourse = async (course) => {    
    const courseUpdateResponse = await axios.put(`${RULE_ENGINE_URL}/api/v1/courses/${course.id}`, course);
    if(courseUpdateResponse.status === 200){
        console.log(`Course Data Updated Successfully ${course.courseId}`);
        return true;
    }else{
        console.log('Course Data Update Fail');
        return false;
    }
}

updateDbCourseContent = async (content) => {
    const PrimaryTitleUpdateResponse = await axios.put(`${RULE_ENGINE_URL}/api/v1/course-content/${content.id}`, content);
    if(PrimaryTitleUpdateResponse.status === 200){
        console.log(`${await content.id} content updated successfully!`);
        return true;
    }else{
        console.log(`${await content.id} content update fail!`);
        return false;
    }
}

updateDbCourseContentSecondaryTitle = async (secondaryTitle) => {
    const UpdatedSecondaryTitleResponse = await axios.put(`${RULE_ENGINE_URL}/api/v1/secondary-title/${secondaryTitle.id}`, secondaryTitle);
   if(updateDbCourseContentSecondaryTitle.status === 200){
    console.log(`Secondary Title Updated Successfully ${await secondaryTitle.id}`);
    return true;
   }else{
    console.log(`Secondary Title Update fail ${await secondaryTitle.id}`);
    return false;
  }
}

router.get("/moodle-course-sync", async (req, res) => {
    let moodleCourses = [], dbCourses = [], processingDbCourse;

    dbCourses = await getDBCoursesData(); //get db courses for sync process
    console.log(dbCourses.length);
    
    moodleCourses = await getMoodleCoursesData(); //get moodle courses for sync process
    console.log(moodleCourses.length);


    await moodleCourses.forEach(async moodleCourse => {
        console.log(`+++++++++ ${moodleCourse.idnumber} +++++++++`);
        processingDbCourse = await dbCourses.find(course=>moodleCourse.idnumber === course.courseId);
        // console.log(`---------- ${processingDbCourse.courseId} ----------`);
        if(processingDbCourse !== undefined){
            console.log(`update course: ${processingDbCourse.courseId}`);
             if(
                    processingDbCourse.shortname !== moodleCourse.shortname &&
                    processingDbCourse.moodleCategoryId !== moodleCourse.categoryid &&
                    processingDbCourse.name !== moodleCourse.displayname &&
                    processingDbCourse.moodleSkillLevel !== moodleCourse.customfields[2].value &&
                    processingDbCourse.introVideoURL !== moodleCourse.customfields[1].value &&
                    processingDbCourse.description !== clearHtmlTags(moodleCourse.summary)
                ){
                    processingDbCourse.shortname = moodleCourse.shortname;
                    processingDbCourse.moodleCategoryId = moodleCourse.categoryid;
                    processingDbCourse.name = moodleCourse.displayname;
                    processingDbCourse.moodleSkillLevel = moodleCourse.customfields[2].value;
                    processingDbCourse.introVideoURL = moodleCourse.customfields[1].value;
                    processingDbCourse.description = clearHtmlTags(moodleCourse.summary);

                    updateDbCourse(processingDbCourse);
                   
                }

                console.log(`${moodleCourse.idnumber} ---- ${processingDbCourse.courseId}`);

               const moodleCourseContents = await getMoodleCourseContent(processingDbCourse.moodleCourseId);
               console.log(`moodleCourseContent length ${moodleCourseContents.length}`);
               
               

               for(let i=0; i<moodleCourseContents.length; i++){
                   processingDbCourse = dbCourses.find(course=>moodleCourse.idnumber === course.courseId);
                    //check and update course content primary title
                    // console.log(processingDbCourse.courseContents);
                    console.log(`for ${i} +> ${moodleCourseContents.length} ---- ${processingDbCourse.courseContents.length} || ${processingDbCourse.moodleCourseId} --- ${processingDbCourse.courseId}`);
                    if(processingDbCourse.courseContents.length>0){
                        const processingContent = await processingDbCourse.courseContents.find(content=> parseInt(content.moodleContentId) === moodleCourseContents[i].id);
                        if(processingContent!==undefined){
                            if(await moodleCourseContents[i].name !== await processingContent.primaryTitle){
                                processingContent.primaryTitle = await moodleCourseContents[i].name;
                                updateDbCourseContent(processingContent);
                            }
                            
                            if(await moodleCourseContents[i].modules.length>0){
                                for(let j=0; j<moodleCourseContents[i].modules.length;j++){
                                    if(processingContent.secondaryTitle.length>0){  
                                        const ProcessingSecondaryTitle = processingContent.secondaryTitle.find(secondaryTitle=>parseInt(secondaryTitle.moodleModuleId) === moodleCourseContents[i].modules[j].id)
                                        if(ProcessingSecondaryTitle!==undefined){
                                            if( moodleCourseContents[i].modules[j].name !== ProcessingSecondaryTitle.title){
                                                ProcessingSecondaryTitle.title = await moodleCourseContents[i].modules[j].name;
                                                updateDbCourseContentSecondaryTitle(ProcessingSecondaryTitle);
                                            }
                                        }else{
                                            console.log('fail to get secondary title');
                                        }
                                    }
                                }
                            }

                        }else{
                            console.log(`fail to find content!!-> ml${moodleCourseContents.length} -- pcl${processingDbCourse.courseContents.length}`);
                        }
                    }
                }

        }else{
            console.log(`create new course: ${moodleCourse.idnumber}`);
            const NewCourseId = await setNewCourseToDB(moodleCourse);
            if(NewCourseId!==undefined && NewCourseId!==false){
               const moodleCourseContents = await getMoodleCourseContent(moodleCourse.id);
               console.log(`moodleCourseContent length ${moodleCourseContents.length}`);
               await moodleCourseContents.forEach(async courseContent => {
                const NewContentId = await setNewCourseContents(courseContent, NewCourseId);
                if(await courseContent.modules.length>0){
                    await courseContent.modules.forEach(async modulesContents => {
                        await setNewCourseContentsSecondaryTitle(modulesContents, NewContentId);
                     })
                }
               })
            }else{
                console.log('setNewCourseToDB Failed!!');
            }
        }
    });

    res.status(200).send('ok');
});

module.exports = router;