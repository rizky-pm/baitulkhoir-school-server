import Students from '../models/StudentModel.js';
import db from '../config/Database.js';
import { decryptAes256cbc } from '../helper/cryptographyAes256Cbc.js';

import { Op } from 'sequelize';

// Start Encryption
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
          'fullName'
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
