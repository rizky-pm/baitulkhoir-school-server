import multer from 'multer';
import schedule from 'node-schedule';
import moment from 'moment';
import 'moment/locale/id.js';
import nodemailer from 'nodemailer';
import { nanoid } from 'nanoid';
import { Op } from 'sequelize';
import { fileTypeFromBuffer } from 'file-type';
import { readChunk } from 'read-chunk';

import db from '../config/Database.js';
import {
  StudentRegistration,
  StudentRegistrationFiles,
  StudentRegistrationPeriod,
} from '../models/StudentRegistrationModel.js';
import { bodyEmail } from '../helper/bodyEmail.js';
import {
  encryptAes256cbc,
  decryptAes256cbc,
} from '../helper/cryptographyAes256Cbc.js';

const secret = {
  iv: Buffer.from('7561b9d82b0c978b753a392f6af42084', 'hex'),
  key: Buffer.from(
    '6bf1159dd33f6e334adfdd9da354e572e690e58d0df4d3cca035b191a5468d58',
    'hex'
  ),
};

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
// End Multer File Uploader

// Start Nodemailer
const transporter = nodemailer.createTransport({
  port: 465,
  host: 'smtp.gmail.com',
  auth: {
    user: 'rizkymahendra2346@gmail.com',
    pass: 'oveshmvjtrvhtkav',
  },
  secure: true,
});
// End Nodemailer

export const getRegistrationPeriod = async (req, res) => {
  try {
    const period = await StudentRegistrationPeriod.findAll();

    res.json(period);
  } catch (error) {
    console.log(error);
  }
};

export const openRegistration = async (req, res) => {
  const { startDate, endDate, registrationPeriod, startSeason } = req.body;

  try {
    await StudentRegistrationPeriod.findOrCreate({
      where: {
        registration_period: registrationPeriod,
      },
      defaults: {
        registration_period: registrationPeriod,
        start_season: startSeason,
        registration_start: startDate,
        registration_end: endDate,
      },
    });

    res.sendStatus(200);
  } catch (error) {
    console.log(error);
  }
};

export const closeRegistration = async (req, res) => {
  const registrationPeriod = req.body[0].registration_period;
  try {
    const response = await StudentRegistrationPeriod.destroy({
      where: {
        registration_period: registrationPeriod,
      },
    });
    res.json(response);
  } catch (error) {
    console.log(error);
  }
};

// Start of configuration auto close registration if registration end 0 0 * * * || */5 * * * * *
schedule.scheduleJob('0 0 * * *', async () => {
  const currentDate = moment().format('YYYY-MM-DD');

  try {
    const response = await StudentRegistrationPeriod.findAll({
      attributes: ['registration_end'],
      raw: true,
    });

    let registrationEnd = response[0]?.registration_end;

    const isRegistrationActive = moment(currentDate).isSameOrBefore(
      registrationEnd,
      'days'
    );

    if (!isRegistrationActive) {
      const seccondResponse = StudentRegistrationPeriod.destroy({
        where: {},
        truncate: true,
      });
      res.json(seccondResponse);
    }

    res.json(response);
  } catch (error) {
    console.log(error);
  }
});
// End of configuration auto close registration if registration end

export const registerStudent = async (req, res, next) => {
  const {
    studentName,
    studentGender,
    studentBirthDate,
    studentAddress,
    parentFullName,
    parentEmail,
    parentPhone,
    period,
  } = req.body;
  const studentId = nanoid();

  try {
    StudentRegistration.create({
      student_id: studentId,
      student_full_name: encryptAes256cbc(
        studentName,
        secret.key,
        secret.iv,
        'fullName'
      ),
      gender: encryptAes256cbc(studentGender, secret.key, secret.iv, 'gender'),
      birth_date: encryptAes256cbc(
        studentBirthDate,
        secret.key,
        secret.iv,
        'birthDate'
      ),
      address: encryptAes256cbc(
        studentAddress,
        secret.key,
        secret.iv,
        'address'
      ),
      parent_full_name: encryptAes256cbc(
        parentFullName,
        secret.key,
        secret.iv,
        'parentFullName'
      ),
      parent_email_address: encryptAes256cbc(
        parentEmail,
        secret.key,
        secret.iv,
        'parentEmailAddress'
      ),
      parent_phone_number: encryptAes256cbc(
        parentPhone,
        secret.key,
        secret.iv,
        'parentPhoneNumber'
      ),
      period: encryptAes256cbc(period, secret.key, secret.iv, 'period'),
    });

    StudentRegistrationFiles.create({
      student_id: studentId,
      student_photo: encryptAes256cbc(
        JSON.stringify(req.files['studentPhoto'][0]),
        secret.key,
        secret.iv,
        'studentPhoto'
      ),
      parent_id_Card: encryptAes256cbc(
        JSON.stringify(req.files['parentIdCard'][0]),
        secret.key,
        secret.iv,
        'parentIdCard'
      ),
      birth_certificate: encryptAes256cbc(
        JSON.stringify(req.files['birthCertificate'][0]),
        secret.key,
        secret.iv,
        'birthCertificate'
      ),
      family_identity_card: encryptAes256cbc(
        JSON.stringify(req.files['familyIdentityCard'][0]),
        secret.key,
        secret.iv,
        'familyIdentityCard'
      ),
    });

    res.send(200);
  } catch (error) {
    next(error);
  }
};

export const getStudentsRegister = async (req, res) => {
  const searchQuery = req.query.q;
  try {
    const studentsRegister = await StudentRegistration.findAll({
      where: {
        student_full_name: { [Op.like]: '%' + searchQuery + '%' },
      },
      raw: true,
    });

    let data = [];

    studentsRegister.map((student) => {
      console.log(student.student_full_name);

      data.push({
        student_id: student.student_id,
        student_full_name: decryptAes256cbc(
          student.student_full_name,
          secret.key,
          secret.iv
        ),
        gender: decryptAes256cbc(student.gender, secret.key, secret.iv),
        birth_date: decryptAes256cbc(student.birth_date, secret.key, secret.iv),
        address: decryptAes256cbc(student.address, secret.key, secret.iv),
        parent_full_name: decryptAes256cbc(
          student.parent_full_name,
          secret.key,
          secret.iv
        ),
        parent_email_address: decryptAes256cbc(
          student.parent_email_address,
          secret.key,
          secret.iv
        ),
        parent_phone_number: decryptAes256cbc(
          student.parent_phone_number,
          secret.key,
          secret.iv
        ),
        period: decryptAes256cbc(student.period, secret.key, secret.iv),
        createdAt: student.createdAt,
        updatedAt: student.updatedAt,
      });
    });

    res.status(200).send(data);
  } catch (error) {
    console.log(error);
  }
};

export const getStudentRegisterDetail = async (req, res) => {
  try {
    const [results, metadata] = await db.query(
      `SELECT * FROM studentregistration INNER JOIN registrationfiles ON studentregistration.student_id = registrationfiles.student_id WHERE studentregistration.student_id = "${req.params.student_id}"`
    );

    const regex = /^.+\//; // match '/' character and everything before it

    const decryptedStudentPhoto = decryptAes256cbc(
      results[0].student_photo,
      secret.key,
      secret.iv,
      'studentPhoto'
    );

    let DecryptedAndParsedStudentPhoto = JSON.parse(decryptedStudentPhoto);

    const studentPhotoMimeType = DecryptedAndParsedStudentPhoto.mimetype;
    const studentPhotoExt = studentPhotoMimeType.replace(regex, ''); // removes '/' character with everything before it

    const decryptedParentIdCard = decryptAes256cbc(
      results[0].parent_id_Card,
      secret.key,
      secret.iv,
      'parentIdCard'
    );

    let DecryptedAndParsedParentIdCard = JSON.parse(decryptedParentIdCard);

    const parentIdCardMimeType = DecryptedAndParsedParentIdCard.mimetype;
    const parentIdCardExt = parentIdCardMimeType.replace(regex, ''); // removes '/' character with everything before it

    const decryptedBirthCertificate = decryptAes256cbc(
      results[0].birth_certificate,
      secret.key,
      secret.iv,
      'birthCertificate'
    );

    let DecryptedAndParsedBirthCertificate = JSON.parse(
      decryptedBirthCertificate
    );

    const birthCertificateMimeType =
      DecryptedAndParsedBirthCertificate.mimetype;
    const birthCertificateExt = birthCertificateMimeType.replace(regex, ''); // removes '/' character with everything before it

    const decryptedFamilyIdentityCard = decryptAes256cbc(
      results[0].family_identity_card,
      secret.key,
      secret.iv,
      'familyIdentityCard'
    );

    let DecryptedAndParsedFamilyIdentityCard = JSON.parse(
      decryptedFamilyIdentityCard
    );

    const familyIdentityCardMimeType =
      DecryptedAndParsedFamilyIdentityCard.mimetype;
    const familyIdentityCardExt = familyIdentityCardMimeType.replace(regex, ''); // removes '/' character with everything before it

    const newResults = [
      {
        // ...results[0],
        student_id: results[0].student_id,
        student_full_name: decryptAes256cbc(
          results[0].student_full_name,
          secret.key,
          secret.iv,
          'studentFullName'
        ),
        gender: decryptAes256cbc(
          results[0].gender,
          secret.key,
          secret.iv,
          'gender'
        ),
        birth_date: decryptAes256cbc(
          results[0].birth_date,
          secret.key,
          secret.iv,
          'birthDate'
        ),
        address: decryptAes256cbc(
          results[0].address,
          secret.key,
          secret.iv,
          'address'
        ),
        parent_full_name: decryptAes256cbc(
          results[0].parent_full_name,
          secret.key,
          secret.iv,
          'parentFullName'
        ),
        parent_email_address: decryptAes256cbc(
          results[0].parent_email_address,
          secret.key,
          secret.iv,
          'parentEmailAddress'
        ),
        parent_phone_number: decryptAes256cbc(
          results[0].parent_phone_number,
          secret.key,
          secret.iv,
          'parentPhoneNumber'
        ),
        period: decryptAes256cbc(
          results[0].period,
          secret.key,
          secret.iv,
          'period'
        ),

        studentPhoto: {
          data: DecryptedAndParsedStudentPhoto.buffer.data,
          extension: studentPhotoExt,
          mimeType: studentPhotoMimeType,
        },

        parentIdCard: {
          data: DecryptedAndParsedParentIdCard.buffer.data,
          extension: parentIdCardExt,
          mimeType: parentIdCardMimeType,
        },
        birthCertificate: {
          data: DecryptedAndParsedBirthCertificate.buffer.data,
          extension: birthCertificateExt,
          mimeType: birthCertificateMimeType,
        },
        familyIdentityCard: {
          data: DecryptedAndParsedFamilyIdentityCard.buffer.data,
          extension: familyIdentityCardExt,
          mimeType: familyIdentityCardMimeType,
        },

        studentPhotoEncrypted: {
          data: results[0].student_photo,
        },
        parentIdCardEncrypted: {
          data: results[0].parent_id_Card,
        },
        birthCertificateEncrypted: {
          data: results[0].birth_certificate,
        },
        familyIdentityCardEncrypted: {
          data: results[0].family_identity_card,
        },
      },
    ];

    res.json(newResults);
  } catch (error) {
    res.status(404).json({ message: 'User not found' });
  }
};

export const approveStudent = async (req, res) => {
  const {
    student_id,
    student_age,
    parent_email_address,
    final_registration_date,
    student_name,
  } = req.body;

  const finalRegistrationDate = moment(final_registration_date).format(
    'Do MMMM YYYY'
  );

  const mailData = {
    from: 'rizkymahendra2346@gmail.com',
    to: parent_email_address,
    subject: 'Status Pendaftaran ' + student_name,
    text: 'Confirmation Email',
    html: bodyEmail(student_name, finalRegistrationDate),
  };

  // let classroom;

  // if (student_age < 5) {
  //   classroom = 'A';
  // } else if (student_age >= 5) {
  //   classroom = 'B';
  // }

  try {
    const [results, metadata] = await db.query(
      `INSERT INTO students (student_id, student_full_name, gender, birth_date, address, parent_full_name, parent_email_address, parent_phone_number, period) SELECT student_id, student_full_name, gender, birth_date, address , parent_full_name, parent_email_address, parent_phone_number, period FROM studentregistration WHERE student_id = "${student_id}"`
    );

    if (results) {
      transporter.sendMail(mailData, async (error, info) => {
        if (error) {
          return console.log(error);
        }
      });
    }

    const response = await StudentRegistration.destroy({
      where: {
        student_id: student_id,
      },
    });

    res.json(response);

    // const [result, met] = await db.query(
    //   `UPDATE students SET student_class = "${classroom}" WHERE id = "${results}"`
    // );

    // res.status(200);
    // res.json(results);
  } catch (error) {
    console.log(error);
  }
};

export const rejectStudent = async (req, res) => {
  const { student_id } = req.body;
  try {
    const respone = await StudentRegistration.destroy({
      where: {
        student_id: student_id,
      },
    });

    res.json(respone);
  } catch (error) {
    console.log(error);
  }
};
