import { Sequelize } from 'sequelize';

import db from '../config/Database.js';

const { DataTypes } = Sequelize;

const Students = db.define(
  'students',
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
    timestamps: false,
  }
);

(async () => {
  await db.sync();
})();

export default Students;
