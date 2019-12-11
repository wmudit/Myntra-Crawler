let helper = require('./helpers/helper')
let utils = require('./lib/utils')
let constants = require('./lib/constants')

async function crawl () {
    try {
        ({browser, categories, xid} = await helper.getCategories());
        console.log(categories);
        console.log(xid);
        let products = [];
        for(let category of categories) {
            products = products.concat([...await helper.getProductsInCategory(browser, category, xid)]);
            await utils.sleep(3 * 1000);
        }
    } catch (err) {
        console.log(err.stack);
    }
}

crawl()