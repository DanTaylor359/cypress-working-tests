const pgp = require('pg-promise')();

const dbConfig = {
  host: 'baanx-ew1uat-bastion.baanxapi.com',
  port: 5432,
  database: 'baanxdb',
  user: 'andrei',
  password: 'kLbWqRddKhh7qA9yFolw2xeIQJSK/UJNMPGRDpEE4/ecSI0QufvqA/Uaw+MKcEgY'
};
const db = pgp(dbConfig);

module.exports = { db };