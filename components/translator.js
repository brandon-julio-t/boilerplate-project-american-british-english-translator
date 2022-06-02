const americanOnly = require("./american-only.js");
const americanToBritishSpelling = require("./american-to-british-spelling.js");
const americanToBritishTitles = require("./american-to-british-titles.js");
const britishOnly = require("./british-only.js");

class Translator {
  constructor() {
    this.americanToBritishDictionary = {};
    this.britishToAmericanDictionary = {};

    [
      ...Object.entries(americanOnly),
      ...Object.entries(americanToBritishSpelling),
      ...Object.entries(americanToBritishTitles),
    ].forEach(([token, translated]) => {
      this.americanToBritishDictionary[token] = translated;
    });

    const britishToAmericanSpelling = this._reverseDictionary(
      americanToBritishSpelling
    );
    const britishToAmericanTitles = this._reverseDictionary(
      americanToBritishTitles
    );

    [
      ...Object.entries(britishOnly),
      ...Object.entries(britishToAmericanSpelling),
      ...Object.entries(britishToAmericanTitles),
    ].forEach(([token, translated]) => {
      this.britishToAmericanDictionary[token] = translated;
    });
  }

  execute(sentence, locale) {
    if (typeof sentence === "undefined" || typeof locale === "undefined") {
      throw new Error("Required field(s) missing");
    }

    if (!sentence) {
      throw new Error("No text to translate");
    }

    if (
      !locale ||
      (locale !== "american-to-british" && locale !== "british-to-american")
    ) {
      throw new Error("Invalid value for locale field");
    }

    let translatedSentence = sentence;

    if (locale === "american-to-british") {
      translatedSentence = this._processTranslation(
        sentence,
        this.americanToBritishDictionary
      );
      translatedSentence = this._processTimeTranslation(
        translatedSentence,
        ":",
        "."
      );
    }

    if (locale === "british-to-american") {
      translatedSentence = this._processTranslation(
        sentence,
        this.britishToAmericanDictionary
      );
      translatedSentence = this._processTimeTranslation(
        translatedSentence,
        ".",
        ":"
      );
    }

    return translatedSentence.includes("</span>")
      ? translatedSentence
      : "Everything looks good to me!";
  }

  _reverseDictionary(dictionary) {
    return Object.entries(dictionary).reduce((newDictionary, entry) => {
      const [token, translated] = entry;
      newDictionary[translated] = token;
      return newDictionary;
    }, {});
  }

  _processTranslation(sentence, dictionary) {
    Object.entries(dictionary).forEach((entry) => {
      const [token, translated] = entry;

      if (this._checkTokenInString(sentence, token)) {
        const originalTokens = sentence.match(new RegExp(token, "gim"));

        originalTokens?.forEach((originalToken) => {
          const isCapitalized = this._isCapitalized(originalToken);
          const newTranslated = this._highlight(
            isCapitalized ? this._toCapitalized(translated) : translated
          );

          sentence = sentence.replace(originalToken, newTranslated);
        });
      }
    });

    return sentence;
  }

  _checkTokenInString(sentence, token) {
    if (token.split(" ").length > 1) {
      const matchByToken = new RegExp(token, "gim").test(sentence);
      if (matchByToken) {
        const leftJoinedWord = `-${token}`;
        const rightJoinedWord = `${token}-`;
        const inBetweenWord = `-${token}-`;

        const tokenIsJoinedWord = [
          leftJoinedWord,
          rightJoinedWord,
          inBetweenWord,
        ]
          .map((tokenString) => new RegExp(tokenString, "gim"))
          .some((regex) => regex.test(sentence));

        return !tokenIsJoinedWord;
      }
    } else {
      const tokens = sentence.match(/\w+/g);
      if (!tokens) return false;

      const matchTokenByToken = tokens.some(
        (t) => t.trim().toLowerCase() === token.trim().toLowerCase()
      );
      if (matchTokenByToken) return true;

      const matchWordByWord = sentence
        .split(" ")
        .some(
          (word) => word.trim().toLowerCase() === token.trim().toLowerCase()
        );
      if (matchWordByWord) return true;
    }

    return false;
  }

  _isCapitalized(str) {
    return /^[A-Z]/.test(str);
  }

  _toCapitalized(str) {
    return str.charAt(0).toUpperCase() + str.substring(1);
  }

  _processTimeTranslation(sentence, oldToken, newToken) {
    const timeRegexString = `[0-9]*[0-9]\\${oldToken}[0-9][0-9]*`;
    const timeRegex = new RegExp(timeRegexString, "g");

    const times = sentence.match(timeRegex);
    if (!times) return sentence;

    times.forEach((time) => {
      const newTime = time.replace(oldToken, newToken);
      sentence = sentence.replace(time, this._highlight(newTime));
    });

    return sentence;
  }

  _highlight(str) {
    return `<span class="highlight">${str}</span>`;
  }
}

module.exports = Translator;
