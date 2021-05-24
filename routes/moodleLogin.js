const express = require('express');
const axios = require("axios");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const router = express.Router();

router.get("/signin", async (req, res) => {
    axios.get("https://stage-lms.thecareerlabs.com/login/index.php").then(async response=>{
        console.log(response);
        //const text = await response.data.text();
        const dom = await new JSDOM(response.data);
         //login with google
        //  console.log(dom.window.document.location);
        dom.window.document.querySelectorAll("a").forEach(element => {
            if(element.title === "google"){
                const SESSKEY = element.href.split("sesskey=")[1];
                console.log(`https://stage-lms.thecareerlabs.com/auth/oauth2/login.php?id=1&wantsurl=https://stage-lms.thecareerlabs.com/course/view.php?id=124&sesskey=${SESSKEY}`);
                //res.redirect(`https://stage-lms.thecareerlabs.com/auth/oauth2/login.php?id=1&wantsurl=/&sesskey=${SESSKEY}`);
               res.redirect(element.href);
            }
        });

        //login with password
        // dom.window.document.querySelectorAll("input").forEach(element => {
        //     if(element.name === "logintoken"){
        //         const TOKEN = element.value;
        //         console.log(`https://stage-lms.thecareerlabs.com/login/index.php?username=deba&password=Deba123$&logintoken=${TOKEN}`);
        //         //res.redirect(`https://stage-lms.thecareerlabs.com/login/index.php?username=deba&password=Deba123$&logintoken=${TOKEN}`);
        //         axios.post(`https://stage-lms.thecareerlabs.com/login/index.php?username=deba&password=Deba123$&logintoken=${TOKEN}`).then(postResponse=>{
        //             // console.log(postResponse);
        //         }).catch(err=>{
        //             console.log(err);
        //         })
        //     }
        // });
        //res.status(200).send(response.data);
    })
})

module.exports = router;