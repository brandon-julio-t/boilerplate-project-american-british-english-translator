"use strict";

const Translator = require("../components/translator.js");

module.exports = function (app) {
  const translator = new Translator();

  app.route("/api/translate").post((req, res) => {
    const { text, locale } = req.body;

    try {
      const translation = translator.execute(text, locale);
      res.json({ text, translation });
    } catch (error) {
      res.json({ error: error.message });
    }
  });
};
