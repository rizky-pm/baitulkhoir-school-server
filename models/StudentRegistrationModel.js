import { Sequelize } from 'sequelize';

import db from '../config/Database.js';
// import StudentRegistrationFiles from './StudentRegistrationFilesModel.js';

const { DataTypes } = Sequelize;

export const StudentRegistration = db.define(
  'studentregistration',
  {
    student_id: {
      type: DataTypes.STRING,
    },
    student_full_name: {
      type: DataTypes.STRING,
    },
    gender: {
      type: DataTypes.STRING,
    },
    birth_date: {
      type: DataTypes.STRING,
    },
    address: {
      type: DataTypes.TEXT('long'),
    },
    parent_full_name: {
      type: DataTypes.STRING,
    },
    parent_email_address: {
      type: DataTypes.STRING,
    },
    parent_phone_number: {
      type: DataTypes.STRING,
    },
    period: {
      type: DataTypes.STRING,
    },
  },
  {
    freezeTableName: true,
  }
);

export const StudentRegistrationFiles = db.define(
  'registrationfiles',
  {
    student_id: {
      type: DataTypes.STRING,
    },
    student_photo: {
      type: DataTypes.TEXT('long'),
    },
    parent_id_Card: {
      type: DataTypes.TEXT('long'),
    },
    birth_certificate: {
      type: DataTypes.TEXT('long'),
    },
    family_identity_card: {
      type: DataTypes.TEXT('long'),
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

export const StudentRegistrationPeriod = db.define('registrationperiod', {
  start_season: {
    type: DataTypes.STRING,
  },
  registration_period: {
    type: DataTypes.STRING,
  },
  registration_start: {
    type: DataTypes.STRING,
  },
  registration_end: {
    type: DataTypes.STRING,
  },
});

StudentRegistration.hasOne(StudentRegistrationFiles);
StudentRegistrationFiles.belongsTo(StudentRegistration);

// (async () => {
//   await db.sync();
// })();

// export default StudentRegistration;
