const path = require("path");
const { listMediaFiles } = require("./list-files");
const { login, logout, searchForFile } = require("./opensub-api");
const { downloadAndExtract } = require("./download");

function replaceExtensionWith(filepath, newExt) {
  let oldExt = path.extname(filepath);
  return filepath.substr(0, filepath.length - oldExt.length) + newExt;
}

function downloadSubtitles(result) {
  const { filepath, searchResults } = result;

  if (searchResults.length == 0) {
    console.log(`No subtitles to download for file ${filepath}`);
    return;
  }

  // Download the first result if there are more than one
  const searchResult = searchResults[0];
  const { MovieName, ZipDownloadLink, IDSubtitle, SubFileName } = searchResult;

  let targetName = replaceExtensionWith(filepath, path.extname(SubFileName));
  let tmpName = `${IDSubtitle}.tmp`;

  return downloadAndExtract(ZipDownloadLink, SubFileName, targetName, tmpName).then(
    () => console.log("Downloaded subtitle file:", SubFileName),
    error => console.error("Failed to download subtitles:", error)
  );
}

function getSubtitlesForFile(loginToken, filepath) {
  let searchResults = searchForFile(loginToken, filepath);

  // Convert the searchResults to a { filepath, searchResults } object
  return searchResults.then(searchResults => ({
    filepath,
    searchResults
  }));
}

function getSubtitlesForDirectory(directory) {
  // Login to the server
  let loginToken = login();

  // List media files from file system. Both operations run in parallel
  let fileList = listMediaFiles(directory, [".avi", ".mkv"]);

  // Wait until both results are available
  return Promise.all([loginToken, fileList]).then(args => {
    // Destructure the parameters
    const [loginToken, fileList] = args;

    // Issue search request for all files in the list
    let results = fileList.map(filepath => getSubtitlesForFile(loginToken, filepath));

    // Logout when all search requests return a response
    Promise.all(results).then(() => logout(loginToken));

    // Return the results (list of promises)
    return results;
  });
}

exports.getSubtitlesForDirectory = getSubtitlesForDirectory;
exports.downloadSubtitles = downloadSubtitles;
