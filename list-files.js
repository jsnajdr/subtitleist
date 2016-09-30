const fs = require("mz/fs");
const path = require("path");

function listMediaFiles(directory, extensions) {
  // Returns promise resolving either to file path or false
  function isMediaFile(filename) {
    const filepath = path.resolve(directory, filename);
    const fileext = path.extname(filename);

    // If the file doesn't have the right extension, return false right away
    if (!extensions.includes(fileext)) {
      return false;
    }

    // stat() the file to determine its properties
    return fs.stat(filepath).then(stats => {
      if (stats.isFile()) {
        console.log(`Found media file ${filepath}`);
        // Return file path if it's a regular file
        return filepath;
      }

      // Return false for non-files (directories etc.)
      return false;
    }).catch(error => {
      console.error(`Cannot stat file ${filepath}:`, error);

      // Return false if stat() call failed for any reason
      return false;
    });
  }

  return fs.readdir(directory).then(list => {
    // Start the isMediaFile check (async) and wait until all files are checked
    return Promise.all(list.map(isMediaFile));
  }).then(list => {
    // Filter out the false values
    let filteredList = list.filter(info => info);
    console.log(`Listed ${filteredList.length} media files in directory ${directory}`);
    return filteredList;
  });
}

exports.listMediaFiles = listMediaFiles;
