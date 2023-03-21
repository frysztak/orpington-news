const express = require('express');
const path = require('path');

const app = express();
const port = 8002;

const feedPages = new Map();

app.get('/feed/:name', function (req, res, next) {
  var options = {
    root: path.join(__dirname, 'static/feeds'),
  };

  const fileName = req.params.name;
  const feedName = path.parse(fileName).name;

  const page = feedPages.get(feedName) ?? 0;
  const finalFilePath = `${feedName}.${String(page).padStart(2, '0')}.xml`;

  res.sendFile(finalFilePath, options, function (err) {
    if (err) {
      next(err);
    }
  });
});

app.put('/feed/:name/page/:page', function (req, res, next) {
  const { name, page } = req.params;
  feedPages.set(name, +page);
  res.status(200).send();
});

app.put('/feed/reset_pages', function (req, res, next) {
  feedPages.clear();
  res.status(200).send();
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
