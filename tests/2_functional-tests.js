const chai = require("chai");
const chaiHttp = require("chai-http");
const assert = chai.assert;
const server = require("../server.js");

chai.use(chaiHttp);

let Translator = require("../components/translator.js");

suite("Functional Tests", () => {
  const url = "/api/translate";

  test("Translation with text and locale fields: POST request to /api/translate", (done) => {
    chai
      .request(server)
      .post(url)
      .send({ text: "text", locale: "american-to-british" })
      .end((err, res) => {
        assert.strictEqual(res.status, 200);
        assert.property(res.body, "text");
        assert.isString(res.body.text);
        assert.property(res.body, "translation");
        assert.isString(res.body.translation);
        done();
      });
  });

  test("Translation with text and invalid locale field: POST request to /api/translate", (done) => {
    chai
      .request(server)
      .post(url)
      .send({ text: "text", locale: "locale" })
      .end((err, res) => {
        assert.strictEqual(res.status, 200);
        assert.property(res.body, "error");
        assert.strictEqual(res.body.error, "Invalid value for locale field");
        assert.notProperty(res.body, "text");
        assert.notProperty(res.body, "translation");
        done();
      });
  });

  test("Translation with missing text field: POST request to /api/translate", (done) => {
    chai
      .request(server)
      .post(url)
      .send({ locale: "american-to-british" })
      .end((err, res) => {
        assert.strictEqual(res.status, 200);
        assert.property(res.body, "error");
        assert.strictEqual(res.body.error, "Required field(s) missing");
        assert.notProperty(res.body, "text");
        assert.notProperty(res.body, "translation");
        done();
      });
  });

  test("Translation with missing locale field: POST request to /api/translate", (done) => {
    chai
      .request(server)
      .post(url)
      .send({ text: "text" })
      .end((err, res) => {
        assert.strictEqual(res.status, 200);
        assert.property(res.body, "error");
        assert.strictEqual(res.body.error, "Required field(s) missing");
        assert.notProperty(res.body, "text");
        assert.notProperty(res.body, "translation");
        done();
      });
  });

  test("Translation with empty text: POST request to /api/translate", (done) => {
    chai
      .request(server)
      .post(url)
      .send({ text: "", locale: "american-to-british" })
      .end((err, res) => {
        assert.strictEqual(res.status, 200);
        assert.property(res.body, "error");
        assert.strictEqual(res.body.error, "No text to translate");
        assert.notProperty(res.body, "text");
        assert.notProperty(res.body, "translation");
        done();
      });
  });

  test("Translation with text that needs no translation: POST request to /api/translate", (done) => {
    chai
      .request(server)
      .post(url)
      .send({ text: "Text", locale: "american-to-british" })
      .end((err, res) => {
        assert.strictEqual(res.status, 200);
        assert.property(res.body, "text");
        assert.strictEqual(res.body.text, "Text");
        assert.property(res.body, "translation");
        assert.strictEqual(res.body.translation, "Everything looks good to me!");
        done();
      });
  });
});
