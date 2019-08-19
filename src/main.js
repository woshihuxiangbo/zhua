const Puppeteer = require('puppeteer');
const Config = require('./Config');
const Taobao = require('./supply/Taobao');
const TMall = require('./supply/Tmall');
const JD = require('./supply/Jd');
const logger = require('./Logger');

logger.info('start puppeteer .......');

(async () => {
    await Puppeteer.launch({
        headless: false,
        defaultViewport: {
            width: 1360,
            height: 800
        }
    }).then(async browser => {
        let addr = Config.defaultHomeUrl;
        let pages = await browser.pages();
        pages[0].goto(addr);
        browser.on('targetcreated', async (target) => {
            let page = await target.page();
            let url = await target.url();
            await addEvent(page, url).catch((e) => {
                logger.error(e)
            });
        });
        browser.on('targetchanged', async (target) => {
            let page = await target.page();
            let url = await target.url();
            await addEvent(page, url).catch((e) => {
                logger.error(e)
            });
        });
    });
})();

async function addEvent(page, url) {
    await page.on('domcontentloaded', async () => {
        await init(page, url);
    });
    page.on('error', () => {
        page.close();
    });
    page.on('close', () => {
    });
}

async function init(page, addr) {
    logger.info('请求:', addr);
    let urls = addr.match(/([a-z0-9--]{1,200})\.([a-z]{2,10})(\.[a-z]{2,10})(\.[a-z]{2,10})?/gi);
    if (!urls || urls.length <= 0) {
        return 0;
    }
    if (Config.domain.indexOf(urls[0]) === -1) return 0;
    if (urls[0].indexOf('taobao') !== -1) {
        logger.info('---tao bao---');
        await Taobao.init(page);
    }
    if (urls[0].indexOf('tmall') !== -1) {
        logger.info('---t tmall---');
        await TMall.init(page);
    }
    if (urls[0].indexOf('jd') !== -1) {
        logger.info('---t jd---');
        await JD.init(page);
    }
}

