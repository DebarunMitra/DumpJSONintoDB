const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs');
const cookies = require('./cookies.json');

const router = express.Router();

router.get("/glogin", async (req, res) => {
    let browser = await puppeteer.launch({headless: false});
    let page = await browser.newPage();

    if(Object.keys(cookies).length){
        await page.setCookie(...cookies);

        await page.goto("https://stage-lms.thecareerlabs.com/login/index.php", {waitUntil: 'networkidle2'});
    } else {
        await page.goto("https://stage-lms.thecareerlabs.com/login/index.php", {waitUntil: 'networkidle2'});

        // await page.type('#email', config.username, {delay: 30});
        // await page.type('#pass', config.password, {delay: 30});

        await page.click('a[title=google]');

        await page.waitForNavigation({waitUntil: 'networkidle0'});
        await page.waitFor(15000);

        try{
            await page.waitFor('[class="avatar current"]');

            // let currentCookies = await page.cookies();

            // fs.writeFileSync('./cookies.json', JSON.stringify(currentCookies));

            await res.redirect('https://stage-lms.thecareerlabs.com/course/view.php?id=124');
        }catch(error){
            console.log('Failed');
            process.exit(0);
        }
    }
});


router.get("/locallogin", async (req, res) => {
    let browser = await puppeteer.launch({ headless: false });
    let page = await browser.newPage();

    if(Object.keys(cookies).length){
        await page.setCookie(...cookies);

        await page.goto("https://stage-lms.thecareerlabs.com/login/index.php", {waitUntil: 'networkidle2'});
    } else {
        await page.goto("https://stage-lms.thecareerlabs.com/login/index.php", {waitUntil: 'networkidle2'});

         await page.type('#username', 'deba', {delay: 30});
         await page.type('#password', 'Deba123$', {delay: 30});

        await page.click('#loginbtn');
        await page.waitForNavigation({waitUntil: 'networkidle0'});
        await page.waitFor(5000);
        try{
            await page.waitFor('[class="avatars"]');

            // let currentCookies = await page.cookies();

            // fs.writeFileSync('./cookies.json', JSON.stringify(currentCookies));

            await res.redirect('https://stage-lms.thecareerlabs.com/course/view.php?id=124');

            await browser.close();
        }catch(error){
            console.log('Failed');
            await browser.close();
            process.exit(1);
        }
    }
})

// (async () => {
//     let browser = await puppeteer.launch({headless: false});
//     let page = await browser.newPage();

//     if(Object.keys(cookies).length){
//         await page.setCookie(...cookies);

//         await page.goto("https://stage-lms.thecareerlabs.com/login/index.php", {waitUntil: 'networkidle2'});
//     } else {
//         await page.goto("https://stage-lms.thecareerlabs.com/login/index.php", {waitUntil: 'networkidle2'});

//         // await page.type('#email', config.username, {delay: 30});
//         // await page.type('#pass', config.password, {delay: 30});

//         await page.click('a[title=google]');

//         await page.waitForNavigation({waitUntil: 'networkidle0'});
//         await page.waitFor(15000);

//         try{
//             await page.waitFor('[class="avatar current"]');
//         }catch(error){
//             console.log('Failed');
//             process.exit(0);
//         }

//         let currentCookies = await page.cookies();

//         fs.writeFileSync('./cookies.json', JSON.stringify(currentCookies));
//     }

//     debugger;
// })


module.exports = router;