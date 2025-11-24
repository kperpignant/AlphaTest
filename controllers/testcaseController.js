const TestCase = require("../models/TestCase");
const cloudinary = require("../middleware/cloudinary");

module.exports = {
  uploadFile: async (req, res) => {
    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "auto" // allows images, videos, documents
      });

      const test = await TestCase.findById(req.params.id);

      test.attachments.push({
        url: result.secure_url,
        public_id: result.public_id
      });

      await test.save();

      res.redirect(`/testcases/${req.params.id}`);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error uploading file");
    }
  }
};
