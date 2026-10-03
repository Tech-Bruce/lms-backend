const fs = require("fs").promises;
const path = require("path");

const deleteFileIfExists = async ({ folderName, filename }) => {
  try {
    if (!folderName || !filename) return;

    const filePath = path.join(__dirname, "..", "uploads", folderName, filename);

    try {
      await fs.access(filePath);
      await fs.unlink(filePath);
      console.log(`Deleted file: ${filePath}`);
    } catch (err) {
      if (err.code !== 'ENOENT') {
        throw err;
      }
    }

  } catch (error) {
    console.error("Error deleting file:", error);
  }
};

module.exports = { deleteFileIfExists };


