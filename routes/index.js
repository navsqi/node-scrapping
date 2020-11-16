var express = require('express');
var router = express.Router();

const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

// 🍺 Scraping with Cheerio
router.get('/news/sport', async (req, res) => {
  try {
    // Get document page from kompas.com
    let { data: dataKompas } = await axios.get('https://bola.kompas.com/');

    // Load in the HTML
    let $ = cheerio.load(dataKompas);
    let list = Array.from($('.most__list'));

    let result = [];

    // 🚀 Manipulating the page's content
    for (let el of list) {
      let title = $(el).find('.most__title').text();
      let link = $(el).find('.most__link').attr('href');

      link = `${link}?page=all`;

      // Get detail content
      let { data: dataKompasArticle } = await axios.get(link);

      // Load detail content in the HTML
      let $KomAr = cheerio.load(dataKompasArticle);

      // Manipulating article, removing whitespace
      let article = $KomAr('.read__content').html().replace(/\s\s+/g, '').replace(/\n+/g, '');

      result.push({ title, link, article });
    }

    res.send(result);
  } catch (e) {
    console.log(e);
    res.send(e);
  }
});

// 🍺 Scraping with Puppeteer
router.get('/news/', async (req, res) => {
  try {
    //opening a new page and navigating to Detik.com
    const browser = await puppeteer.launch({ headless: true });
    const detikPage = await browser.newPage();
    await detikPage.goto('https://www.detik.com/');
    await detikPage.waitForSelector('body');

    // 🔥 Manipulating the page's content
    let grabPosts = await detikPage.evaluate(() => {
      let allPosts = document.body.querySelectorAll('.berita-utama .media__title .media__link');

      // Storing the post item in an array then selecting for retrieving content
      let scrapeItems = [];

      allPosts.forEach((el) => {
        let title = el.innerText;
        let link = el.getAttribute('href');

        scrapeItems.push({ title, link });
      });

      return scrapeItems;
    });

    await browser.close();
    res.send(grabPosts);
  } catch (e) {
    console.error(e);
  }
});

module.exports = router;
