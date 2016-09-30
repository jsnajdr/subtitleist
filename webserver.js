const path = require("path");
const express = require("express");
const ejs = require("ejs");
const { getSubtitlesForDirectory, downloadSubtitles } = require("./subtitles");

let directory = process.argv[2];

// Convert the search results array into data structure for rendering
function directoryInfo(results) {
  return results.map(result => {
    return {
      name: result.filepath,
      links: result.searchResults.map(res => res.SubFileName),
    };
  });
}

const viewsDir = path.resolve(__dirname, "./views");

const app = express();
app.set('views', viewsDir);
app.use("/static", express.static("./static"));

app.get("/", (req, res) => {
  getSubtitlesForDirectory(directory).then(
    // Wait until all results come in - we need them all here
    results => Promise.all(results)
  ).then(results => {
    // Render the index page with the file list
    res.render("index.ejs", {
      directory,
      files: directoryInfo(results)
    });
  }).catch(
    error => console.log("Error:", error)
  );
});

app.post("/download", (req, res) => {
  getSubtitlesForDirectory(directory).then(
    // For each of the search results (promise) download the subtitles
    results => results.map(result => result.then(downloadSubtitles))
  ).then(
    // Wait until all the downloads are done
    downloads => Promise.all(downloads)
  ).then(
    () => res.redirect(303, "/")
  ).catch(
    error => console.log("Error:", error)
  );
});

app.listen(5000);
