const opensubtitles = require("subtitler");

function login() {
  return opensubtitles.api.login().then(loginToken => {
    console.log(`Logged in with token: ${loginToken}`);
    return loginToken;
  });
}

function logout(loginToken) {
  return opensubtitles.api.logout(loginToken).then(() => {
    console.log(`Logged out of session with token: ${loginToken}`);
  });
}

function searchForFile(loginToken, filepath) {
  console.log(`Issuing search for file ${filepath}`);
  let results = opensubtitles.api.searchForFile(loginToken, "cze", filepath);

  return results.then(results => {
    console.log(`Results for file ${filepath}:`);

    if (results.length == 0) {
      console.log("  Nothing found");
    }

    for (let result of results) {
      const { MovieName, ZipDownloadLink, IDSubtitle, SubFileName } = result;

      console.log("  Movie name:", MovieName);
      console.log("  ZIP download link:", ZipDownloadLink);
      console.log("  Subtitles ID:", IDSubtitle);
      console.log("  Subtitles file name:", SubFileName);
    }

    return results;
  }).catch(error => {
    // In case of failure, log the error and recover to an empty array
    console.error(`Failed search for file ${filepath}:`, error);
    return [];
  });
}

exports.login = login;
exports.logout = logout;
exports.searchForFile = searchForFile;
