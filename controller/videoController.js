const Grid = require("gridfs-stream");
const mongoose = require("mongoose");
const Video = require("../models/video");
const { convertVideo, generateThumbnail } = require("../utils/ffmpegUtils");
const path = require("path");
const fs = require("fs");

const uploadVideo = async (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const { originalname, mimetype, size, buffer } = file;
  const uploadDate = new Date();
  const gfs = req.app.locals.gfs; // Access GridFS instance

  const writestream = gfs.createWriteStream({ filename: originalname, contentType: mimetype });

  writestream.on("close", async (file) => {
    try {
      const newVideo = new Video({
        filename: file.filename,
        contentType: file.contentType,
        length: file.length,
        uploadDate: file.uploadDate,
      });
      await newVideo.save();
      res.status(200).json({ file });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  writestream.end(buffer);
};

const streamVideo = (req, res) => {
  const gfs = Grid(req.app.locals.db, mongoose.mongo);
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    if (err || !file || file.length === 0) {
      return res.status(404).json({ error: "No file exists" });
    }
    if (file.contentType === "video/mp4") {
      const readstream = gfs.createReadStream({ filename: file.filename });
      res.set("Content-Type", file.contentType);
      readstream.pipe(res);
    } else {
      res.status(404).json({ error: "Not a video file" });
    }
  });
};

const convertVideoFormat = async (req, res) => {
  const filename = req.params.filename;
  const format = req.params.format;
  const outputPath = path.join(__dirname, `../tmp/${path.basename(filename, path.extname(filename))}.${format}`);

  const gfs = Grid(req.app.locals.db, mongoose.mongo);
  gfs.files.findOne({ filename }, (err, file) => {
    if (err || !file || file.length === 0) {
      return res.status(404).json({ error: "No file exists" });
    }
    if (file.contentType === "video/mp4") {
      const readstream = gfs.createReadStream({ filename: file.filename });

      convertVideo(readstream, format, outputPath)
        .then(() => {
          res.sendFile(outputPath, (err) => {
            if (err) {
              res.status(500).json({ error: "Error sending file", details: err.message });
            }
            fs.unlinkSync(outputPath); // Cleanup
          });
        })
        .catch((err) =>
          res.status(500).json({ error: "Conversion failed", details: err.message })
        );
    } else {
      res.status(404).json({ error: "Not a video file" });
    }
  });
};

const generateVideoThumbnail = async (req, res) => {
  const filename = req.params.filename;
  const outputPath = path.join(__dirname, `../tmp/${path.basename(filename, path.extname(filename))}-thumbnail.png`);

  const gfs = Grid(req.app.locals.db, mongoose.mongo);
  gfs.files.findOne({ filename }, (err, file) => {
    if (err || !file || file.length === 0) {
      return res.status(404).json({ error: "No file exists" });
    }
    if (file.contentType === "video/mp4") {
      const readstream = gfs.createReadStream({ filename: file.filename });

      generateThumbnail(readstream, outputPath)
        .then(() => {
          res.sendFile(outputPath, (err) => {
            if (err) {
              res.status(500).json({ error: "Error sending file", details: err.message });
            }
            fs.unlinkSync(outputPath); // Cleanup
          });
        })
        .catch((err) =>
          res.status(500).json({ error: "Thumbnail generation failed", details: err.message })
        );
    } else {
      res.status(404).json({ error: "Not a video file" });
    }
  });
};

module.exports = {
  uploadVideo,
  streamVideo,
  convertVideoFormat,
  generateVideoThumbnail,
};
