import Students from '../models/StudentModel.js';
import db from '../config/Database.js';
import {
  encryptFile,
  decryptFile,
  encryptString,
  decryptString,
} from '../helper/encryption.js';

import multer from 'multer';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileTypeFromBuffer } from 'file-type';
import { Op } from 'sequelize';

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

export const getStudents = async (req, res) => {
  const searchQuery = req.query.q;

  try {
    let data = [];

    const students = await Students.findAll({
      where: {
        student_full_name: { [Op.like]: '%' + searchQuery + '%' },
      },
      raw: true,
    });

    students.forEach((student) => {
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
      });
    });

    res.status(200).send(data);
  } catch (error) {
    console.log(error);
  }
};

export const getStudentDetail = async (req, res) => {
  try {
    const [results, metadata] = await db.query(
      `SELECT * FROM students INNER JOIN registrationfiles ON students.student_id = registrationfiles.student_id WHERE students.student_id = "${req.params.student_id}"`
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

export const deleteStudent = async (req, res) => {
  const { selectedStudent } = req.body;

  let selectedId = [];

  selectedStudent.forEach((selected) => {
    selectedId.push(selected.studentId);
  });

  try {
    const response = await Students.destroy({
      where: {
        student_id: selectedId,
      },
    });

    res.json(response);
  } catch (error) {
    res.json(error);
  }
};
