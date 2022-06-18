import express from 'express';
import multer from 'multer';

import { getUsers, Register, Login, Logout } from '../controllers/Users.js';
import {
  getRegistrationPeriod,
  getStudentsRegister,
  getStudentRegisterDetail,
  registerStudent,
  approveStudent,
  openRegistration,
  rejectStudent,
  closeRegistration,
} from '../controllers/StudentRegistration.js';
import {
  getStudents,
  getStudentDetail,
  deleteStudent,
} from '../controllers/Students.js';

import { verifyToken } from '../middleware/VerifyToken.js';
import { refreshToken } from '../controllers/RefreshToken.js';

const router = express.Router();

// Start Multer File Uploader
const storage = multer.memoryStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

router.post('/users', Register);
router.post('/login', Login);
router.post(
  '/register-student',
  upload.fields([
    {
      name: 'studentPhoto',
      maxCount: 1,
    },
    {
      name: 'parentIdCard',
      maxCount: 1,
    },
    {
      name: 'birthCertificate',
      maxCount: 1,
    },
    {
      name: 'familyIdentityCard',
      maxCount: 1,
    },
  ]),
  registerStudent
);
router.post('/approve-student/', verifyToken, approveStudent);
router.post('/reject-student', verifyToken, rejectStudent);
router.post('/open-registration', verifyToken, openRegistration);

router.get('/students', verifyToken, getStudents);
router.get('/student/:student_id', verifyToken, getStudentDetail);
router.get('/register-period', getRegistrationPeriod);
router.get('/new-students', verifyToken, getStudentsRegister);
router.get('/new-student/:student_id', verifyToken, getStudentRegisterDetail);
router.get('/users', verifyToken, getUsers);
router.get('/token', refreshToken);

router.delete('/delete-student', verifyToken, deleteStudent);
router.delete('/close-registration', verifyToken, closeRegistration);
router.delete('/logout', Logout);

export default router;
