let puppeteer = require('puppeteer');

async function intantiateBrowser () {
    let broswer = await puppeteer.launch ({
        // headless: false,
        // devtools: false
    });
    return broswer;
}

async function sleep (timeInMillis) {
    return new Promise ( (resolve, reject) => {
        setTimeout(resolve, timeInMillis);
    })
}

module.exports = {
    intantiateBrowser,
    sleep
}