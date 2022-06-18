import multer from 'multer';
import crypto from 'crypto';
import fs, { truncateSync } from 'fs';
import path from 'path';
import schedule from 'node-schedule';
import moment from 'moment';
import 'moment/locale/id.js';
import nodemailer from 'nodemailer';
import stream, { Stream } from 'stream';
import { nanoid } from 'nanoid';
import { fileTypeFromBuffer } from 'file-type';
import { Op } from 'sequelize';

import db from '../config/Database.js';
import {
  StudentRegistration,
  StudentRegistrationFiles,
  StudentRegistrationPeriod,
} from '../models/StudentRegistrationModel.js';
import {
  encrypt,
  decrypt,
  encryptFile,
  decryptFile,
  encryptString,
  decryptString,
} from '../helper/encryption.js';
import Students from '../models/StudentModel.js';
import { bodyEmail } from '../helper/bodyEmail.js';

// Start Encryption
const CryptoAlgorithm = 'aes-256-cbc';
const secret = {
  iv: Buffer.from('7561b9d82b0c978b753a392f6af42084', 'hex'),
  key: Buffer.from(
    '6bf1159dd33f6e334adfdd9da354e572e690e58d0df4d3cca035b191a5468d58',
    'hex'
  ),
};

// End Encryption

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

    console.log(period);
    res.json(period);
  } catch (error) {
    console.log(error);
  }
};

export const openRegistration = async (req, res) => {
  const { startDate, endDate, registrationPeriod, startSeason } = req.body;
  console.log(req.body);

  try {
    console.log('openRegistration');
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
    console.log(registrationEnd);

    const isRegistrationActive = moment(currentDate).isSameOrBefore(
      registrationEnd,
      'days'
    );

    // console.log(isRegistrationActive);

    if (!isRegistrationActive) {
      console.log('expired!');
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
      student_full_name: encryptString(studentName, secret.key, secret.iv),
      gender: encryptString(studentGender, secret.key, secret.iv),
      birth_date: encryptString(studentBirthDate, secret.key, secret.iv),
      address: encryptString(studentAddress, secret.key, secret.iv),
      parent_full_name: encryptString(parentFullName, secret.key, secret.iv),
      parent_email_address: encryptString(parentEmail, secret.key, secret.iv),
      parent_phone_number: encryptString(parentPhone, secret.key, secret.iv),
      period: encryptString(period, secret.key, secret.iv),
    });

    StudentRegistrationFiles.create({
      student_id: studentId,
      student_photo: encryptFile(
        req.files['studentPhoto'][0].buffer,
        secret.key,
        secret.iv
      ),
      parent_id_Card: encryptFile(
        req.files['parentIdCard'][0].buffer,
        secret.key,
        secret.iv
      ),
      birth_certificate: encryptFile(
        req.files['birthCertificate'][0].buffer,
        secret.key,
        secret.iv
      ),
      family_identity_card: encryptFile(
        req.files['familyIdentityCard'][0].buffer,
        secret.key,
        secret.iv
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

    // console.log({ studentsRegister });

    let data = [];

    studentsRegister.map((student) => {
      data.push({
        student_id: student.student_id,
        student_full_name: decryptString(
          student.student_full_name,
          secret.key,
          secret.iv
        ),
        gender: decryptString(student.gender, secret.key, secret.iv),
        birth_date: decryptString(student.birth_date, secret.key, secret.iv),
        address: decryptString(student.address, secret.key, secret.iv),
        parent_full_name: decryptString(
          student.parent_full_name,
          secret.key,
          secret.iv
        ),
        parent_email_address: decryptString(
          student.parent_email_address,
          secret.key,
          secret.iv
        ),
        parent_phone_number: decryptString(
          student.parent_phone_number,
          secret.key,
          secret.iv
        ),
        period: decryptString(student.period, secret.key, secret.iv),
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

    const decryptedStudentPhoto = decryptFile(
      results[0].student_photo,
      secret.key,
      secret.iv
    );
    const decryptedParentIdCard = decryptFile(
      results[0].parent_id_Card,
      secret.key,
      secret.iv
    );
    const decryptedBirthCertificate = decryptFile(
      results[0].birth_certificate,
      secret.key,
      secret.iv
    );
    const decryptedFamilyIdentityCard = decryptFile(
      results[0].family_identity_card,
      secret.key,
      secret.iv
    );

    const studentPhotoFileType = await fileTypeFromBuffer(
      decryptedStudentPhoto
    );
    const parentIdCardFileType = await fileTypeFromBuffer(
      decryptedParentIdCard
    );
    const birthCertificateFileType = await fileTypeFromBuffer(
      decryptedBirthCertificate
    );
    const familyIdentityCardFileType = await fileTypeFromBuffer(
      decryptedFamilyIdentityCard
    );

    const newResults = [
      {
        // ...results[0],
        student_id: results[0].student_id,
        student_full_name: decryptString(
          results[0].student_full_name,
          secret.key,
          secret.iv
        ),
        gender: decryptString(results[0].gender, secret.key, secret.iv),
        birth_date: decryptString(results[0].birth_date, secret.key, secret.iv),
        address: decryptString(results[0].address, secret.key, secret.iv),
        parent_full_name: decryptString(
          results[0].parent_full_name,
          secret.key,
          secret.iv
        ),
        parent_email_address: decryptString(
          results[0].parent_email_address,
          secret.key,
          secret.iv
        ),
        parent_phone_number: decryptString(
          results[0].parent_phone_number,
          secret.key,
          secret.iv
        ),
        period: decryptString(results[0].period, secret.key, secret.iv),
        studentPhoto: {
          data: decryptedStudentPhoto,
          extension: studentPhotoFileType.ext,
          mimeType: studentPhotoFileType.mime,
        },
        parentIdCard: {
          data: decryptedParentIdCard,
          extension: parentIdCardFileType.ext,
          mimeType: parentIdCardFileType.mime,
        },
        birthCertificate: {
          data: decryptedBirthCertificate,
          extension: birthCertificateFileType.ext,
          mimeType: birthCertificateFileType.mime,
        },
        familyIdentityCard: {
          data: decryptedFamilyIdentityCard,
          extension: familyIdentityCardFileType.ext,
          mimeType: familyIdentityCardFileType.mime,
        },
      },
    ];

    console.log({ results });
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

        const respone = await StudentRegistration.destroy({
          where: {
            student_id: student_id,
          },
        });

        res.status(200);
      });
    }

    // const [result, met] = await db.query(
    //   `UPDATE students SET student_class = "${classroom}" WHERE id = "${results}"`
    // );

    // res.status(200);
    res.json(results);
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
