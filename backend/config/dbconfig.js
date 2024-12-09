import sql from "mssql";
import dotenv from "dotenv";

dotenv.config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

export async function connectToDatabase() {
  try {
    await sql.connect(config);
    console.log("Connected to the database");
  } catch (err) {
    console.error("Database connection failed:", err);
    process.exit(1);
  }
}

export async function query(sqlQuery, params = []) {
  try {
    const pool = await sql.connect(config);
    const request = pool.request();

    params.forEach((param, index) => {
      request.input(`param${index}`, param);
    });

    const result = await request.query(sqlQuery);
    return result.recordset;
  } catch (err) {
    console.error("Error executing query:", err);
    throw err;
  }
}
