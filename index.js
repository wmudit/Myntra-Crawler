let helper = require('./helpers/helper')
let utils = require('./lib/utils')
let constants = require('./lib/constants')
var fs = require('fs');

async function crawl () {
    try {
        ({browser, categories, xid} = await helper.getCategories());
        console.log(categories);
        console.log(xid);
        let products = [];
        for(let category of categories) {
            products = await helper.getProductsInCategory(browser, category, xid);
            // products = products.concat([...await helper.getProductsInCategory(browser, category, xid)]);
            if(products)
                writeToFile(products);
            await utils.sleep(3 * 1000);
        }
        await utils.sleep(60 * 1000);
    } catch (err) {
        console.log(err.stack);
    }
}

function writeToFile (products) {
    for(let i = 0; i < products.length; i++) {
        fs.appendFileSync('products.json', JSON.stringify(products[i]) + ",\n");
    }
}

crawl()