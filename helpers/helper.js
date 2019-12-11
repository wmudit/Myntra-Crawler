let utils = require('../lib/utils');

function getXID (cookies) {
    if(!cookies)
        return undefined;
    for(let i = 0; i < cookies.length; i++) {
        if(cookies[i].name == "xid")
            return cookies[i].value;
    }
    return undefined;
}

async function getCategories () {
    let browser = await utils.intantiateBrowser();
    let page  = await browser.newPage();
    await page.setDefaultNavigationTimeout(60 * 1000);
    await page.goto("https://www.myntra.com");
    let xid = getXID(await page.cookies());
    let categories = await page.evaluate ( () => {
        try { 
            let mainNavLinks = [...document.querySelectorAll('.desktop-main')].map(e => e.innerText);
            let mainNavDivs = [...document.querySelectorAll('.desktop-categoryContainer')];
            let result = [];
            for(let i = 0; i < mainNavDivs.length; i++) 
                result = result.concat([...[...mainNavDivs[i].querySelectorAll('.desktop-categoryLink')].filter(e => e.href).map(e => e.href.split("/")[e.href.split("/").length - 1])]);
            delete(result['DISCOVER']);
            return result;
        }
        catch (err) {
            return undefined;
        }
    })
    await page.close();
    return {browser, categories, xid};
}

async function getProductsInCategory (browser, categoryShorthand, deviceId) {
    let page = await browser.newPage();
    await page.goto(`https://www.myntra.com/${categoryShorthand}`);
    let currCount = 0, totalCount = 190, limit = 190, pageNo = 0;
    let products = [];
    while (currCount < totalCount) {
        let obj = await page.evaluate( (categoryShorthand, pageNo, limit, deviceId) => {
            categoryShorthand += categoryShorthand.includes("?") ? "&" : "?";
            let p = fetch(`https://www.myntra.com/web/v1/search/${categoryShorthand}p=${pageNo}&rows=${limit}&o=`, 
                {
                    "credentials": "include",
                    "headers": {
                        "accept": "application/json",
                        "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
                        "app": "web",
                        "content-type": "application/json",
                        "sec-fetch-mode": "cors",
                        "sec-fetch-site": "same-origin",
                        "x-meta-app": "channel=web",
                        "x-myntra-app": "deviceID=" + deviceId + ";customerID=;reqChannel=web;",
                        "x-myntra-network": "yes",
                        "x-myntraweb": "Yes",
                        "x-requested-with": "browser"
                    },
                    "referrer": "https://www.myntra.com/" + categoryShorthand,
                    "referrerPolicy": "no-referrer-when-downgrade",
                    "body": null,
                    "method": "GET",
                    "mode": "cors"
                }
            )
            .then(result => result.json());
            return p;
        }, categoryShorthand, pageNo, limit, deviceId)
        totalCount = obj.totalCount;
        currCount += limit;
        pageNo++;
        products = products.concat([...obj.products]);
        await utils.sleep(0.5 * 1000);
        console.log(`Crawled ${products.length} ${categoryShorthand} out of ${totalCount}`);
    }
    return products;
}

module.exports = {
    getCategories,
    getProductsInCategory
}