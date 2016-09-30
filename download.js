const fs = require("fs");
const http = require('http');
const child_process = require("child_process");

function download(url, filepath) {
  return new Promise((resolve, reject) => {
    let request = http.get(url, function(response) {
      let f = fs.createWriteStream(filepath);

      response.pipe(f);

      f.on("finish", () => {
        f.close(error => {
          if (error) {
            console.error("File close error:", error);
            fs.unlink(filepath);
            reject(error);
          } else {
            console.log("Download saved to file:", filepath);
            resolve();
          }
        });
      });
    });

    request.on("error", error => {
      console.error("Request error:", error);
      fs.unlink(filepath);
      reject(error);
    });
  });
}

function unzip(zipFile, archiveFile, outputFile) {
  console.log(`Unzipping file ${zipFile}, saving subtitles to file ${outputFile}`);

  return new Promise((resolve, reject) => {
    child_process.execFile(
      "unzip",
      [ "-qq", "-p", zipFile, archiveFile ],
      {
        encoding: "buffer",
        maxBuffer: 1024 * 1024
      },
      (error, stdout, stderr) => {
        if (error) {
          console.error("Error unzipping:", error);
          reject(error);
        } else {
          let f = fs.createWriteStream(outputFile);

          f.write(stdout);
          f.end();

          f.on("finish", () => {
            f.close(error => {
              if (error) {
                console.error("File close error:", error);
                fs.unlink(outputFile);
                reject(error);
              } else {
                console.log("Subtitles saved to file:", outputFile);
                resolve();
              }
            });
          });
        }
      }
    );
  });
}

function downloadAndExtract(url, subFile, outputFile, tmpFile) {
  console.log(`Downloading subtitles from URL: ${url}`);
  let down = download(url, tmpFile).then(
    () => unzip(tmpFile, subFile, outputFile)
  );

  down.catch(
    error => console.error("Error while download:", error)
  ).then(
    // Remove the tmp file in case of error or success
    () => fs.unlink(tmpFile)
  );

  return down;
}

exports.downloadAndExtract = downloadAndExtract;
