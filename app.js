const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const penthouse = require("penthouse");
const path = require("path");
const getCss = require("get-css");
const puppeteer = require("puppeteer");

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/static/index.html"));
});

app.post("/generate", (req, res) => {
  let url = req.body.url;
  const options = {
    timeout: 5000,
  };
  getCss(url, options)
    .then(function (response) {
      const browserPromise = puppeteer.launch({
        ignoreHTTPSErrors: true,
        args: ["--disable-setuid-sandbox", "--no-sandbox"],
        defaultViewport: {
          width: 1300,
          height: 900,
        },
      });

      penthouse({
        url: url,
        cssString: response.css,
        puppeteer: {
          getBrowser: () => browserPromise,
        },
      }).then((criticalCss) => {
        res.send(criticalCss);
      });
    })
    .catch(function (error) {
      console.error(error);
    });
});

app.listen(port, () => {
  console.log(`App listening - PORT ` + port);
});
