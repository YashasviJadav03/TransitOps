const express = require('express');
const multer = require('multer');
const path = require('path');
const { getVehicleDocuments, uploadVehicleDocument, deleteVehicleDocument } = require('../controllers/vehicleDocumentController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/rbacMiddleware');

const router = express.Router();

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads', 'vehicle_documents'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});
const upload = multer({ storage: storage });

router.use(authMiddleware);
// Allow Fleet Manager, Dispatcher, Safety Officer to view docs
router.get('/:id/documents', authorizeRoles('Fleet Manager', 'Dispatcher', 'Safety Officer'), getVehicleDocuments);

// Only Fleet Manager can upload and delete docs
router.post('/:id/documents', authorizeRoles('Fleet Manager'), upload.single('document'), uploadVehicleDocument);
router.delete('/documents/:docId', authorizeRoles('Fleet Manager'), deleteVehicleDocument);

module.exports = router;
