import multer from "multer";

// using disk storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname) // need to change file name
    }
  })
  
  export const upload = multer({ 
    storage,
})