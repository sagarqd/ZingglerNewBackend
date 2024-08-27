const Grid = require("gridfs-stream");
const mongoose = require("mongoose");
const Video = require("../models/video");
const Question = require("../models/questions");
const { convertVideo, generateThumbnail } = require("../utils/ffmpegUtils");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require('uuid');


const uploadVideo = async (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const { originalname, mimetype, buffer } = file;
  const { questions } = req.body;
  const uploadDate = new Date();
  const videoId = uuidv4(); 
  const uploadPath = path.join(__dirname, '..', 'uploads', `${videoId}-${originalname}`);

  try {
    let parsedQuestions = [];
    try {
      parsedQuestions = JSON.parse(questions);
    } catch (err) {
      return res.status(400).json({ error: 'Invalid JSON format for questions' });
    }

    const questionTimings = await Promise.all(
      parsedQuestions.map(async (q) => {
        let questionId;
        if (q._id) {
          const updatedQuestion = await Question.findByIdAndUpdate(
            q._id,
            {
              question: q.question,
              options: q.options || [], // Update options if provided
              correctAnswers: q.correctAnswers || [], // Update correct answers if provided
              type: q.type || 'one-line', // Include the type field
              isDefault: q.isDefault || false
            },
            { new: true, runValidators: true }
          );
          questionId = updatedQuestion._id;
        } else {
          const newQuestion = new Question({
            question: q.question,
            options: q.options || [],
            correctAnswers: q.correctAnswers || [],
            type: q.type || 'one-line', // Include the type field
            isDefault: q.isDefault || false
          });
          await newQuestion.save();
          questionId = newQuestion._id;
        }

        return {
          question: questionId,
          startTime: q.startTime, 
          endTime: q.endTime      
        };
      })
    );

    fs.writeFile(uploadPath, buffer, async (err) => {
      if (err) {
        console.error('Error saving file:', err);
        return res.status(500).json({ error: 'File save error' });
      }

      const newVideo = new Video({
        filename: `${videoId}-${originalname}`,
        contentType: mimetype,
        length: buffer.length,
        uploadDate: uploadDate,
        questions: questionTimings, 
      });

      await newVideo.save();
      res.status(200).json({ file: newVideo });
    });

  } catch (err) {
    console.error('Error processing video upload:', err);
    res.status(500).json({ error: err.message });
  }
};



const fetchAllVideo = async(req,res) => {
  try {
    const video = await Video.find().populate({
      path: 'questions.question', 
    });
    res.status(200).send({
      message:"Fetched All the video",
      video,
      success:true
    });
  } catch (error) {
    console.log('Error Fetching video:',error),
    res.status(500).json({ error: error.message });
  }
}

const fetchVideoByID = async(req,res)=>{
  try {
    const {id} = req.params;
    const video = await Video.findById(id).populate({
      path: 'questions.question', 
    });
    res.status(200).send({
      message:"Fetched the video By Id",
      video,
      success:true
    });

  } catch (error) {
      console.log('Error Fetching video By ID:',error),
      res.status(500).json({ error: error.message });
  }
}










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
  fetchAllVideo,
  fetchVideoByID,
  streamVideo,
  convertVideoFormat,
  generateVideoThumbnail,
};
