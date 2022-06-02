import { Sequelize } from 'sequelize';

const db = new Sequelize('baitulkhoir_db', 'root', 'qwerty666', {
  host: 'localhost',
  dialect: 'mysql',
});

export default db;
