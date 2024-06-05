const fs = require("fs");

// -----------------------------------------------------------------
// --- Phương thức dùng để xóa các ảnh trong thư mục images --------
// -----------------------------------------------------------------

const deleteFiles = (arrayPath) => {
  if (arrayPath && arrayPath.length > 0) {
    for (let i = 0; i < arrayPath.length; i++) {
      fs.unlink(arrayPath[i], (err) => {
        if (err) {
          console.log("Error unlink:", err.message);
        }
      });
    }
  }
};
// -------------------------------------------------------------

exports.deleteFiles = deleteFiles;
