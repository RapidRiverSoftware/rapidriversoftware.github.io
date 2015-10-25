#!/usr/bin/env node
var fs = require("fs");

var regexes = {
  any: {
    start: /<!--\s*(JS|CSS)/i
  },
  js: {
    start: /<!--\s*JS(?:\s+\(([^)]+)\))?\s*-->/i,
    end: /<!--\s*\/JS\s*-->/i,
    tag: "<script src=\"$1\"></script>",
    defaultMatch: "js/bundle.js"
  },
  css: {
    start: /<!--\s*CSS(?:\s+\(([^)]+)\))?\s*-->/i,
    end: /<!--\s*\/CSS\s*-->/i,
    tag: "<link rel=\"stylesheet\" href=\"$1\">",
    defaultMatch: "css/bundle.css"
  }
};

function replaceTags(src, spec) {
  "use strict";
  var startMatch = spec.start.exec(src);
  var endMatch = spec.end.exec(src);
  var dest = startMatch[1] || spec.defaultMatch;

  if (!startMatch || !endMatch) {
    throw new Error("Can't understand HTML. Please fix comments");
  }

  var startLocation = startMatch.index;
  var endLocation = endMatch.index + endMatch[0].length;

  return [
    src.substr(0, startLocation),
    spec.tag.replace("$1", dest),
    src.substr(endLocation)
  ].join("");
}

function buildAllTags (html) {
  var builtHtml = html;
  var anyMatch;

  while ((anyMatch = regexes.any.start.exec(builtHtml)) !== null) {
    var type = anyMatch[1].toLowerCase();
    builtHtml = replaceTags(builtHtml, regexes[type]);
  }

  return builtHtml;
}

var argv = process.argv;
var srcPath = argv[2];
var destPath = argv[3];

var encoding = {encoding: "utf8"};

if (!srcPath || !destPath) {
  console.log("Usage: build-html.js <src-path> <dest-path>");
  process.exit(1);
}

fs.readFile(srcPath, encoding, function (err, html) {
  if (err) {
    throw err;
  }

  var builtHtml = buildAllTags(html);

  fs.writeFile(destPath, builtHtml, encoding, function (err) {
    if (err) {
      throw err;
    }

    console.log("HTML Built!");
  });
});
