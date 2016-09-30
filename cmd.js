const { getSubtitlesForDirectory, downloadSubtitles } = require("./subtitles");

let directory = process.argv[2];

getSubtitlesForDirectory(directory).then(
  results => results.map(
    result => result.then(downloadSubtitles)
  )
);
