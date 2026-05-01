require("dotenv").config();

const express = require("express");
const sql     = require("mssql");
const cors    = require("cors");


const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// ── Database connection settings ────────────────────────────────
const dbConfig = {
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: 1433,
    options: { 
        encrypt: false,
        trustServerCertificate: true 
    }
};

// ── Connect to SQL Server ────────────────────────────────────────
async function connectToDatabase() {
    try {
        const pool = await sql.connect(dbConfig);
        console.log("Connected to SQL Server");
        return pool;
    } catch (error) {
        console.error("Database connection failed:", error);
    }
}

// ── GET all businesses ──────────────────────────────────────────
app.get("/api/businesses", async (req, res) => {
    try {
        const pool   = await connectToDatabase();
        const result = await pool.request().query(`
            SELECT BusinessID, BusinessName, BusinessType,
                   City, State, Phone, Email, Website, ServicesOffered
            FROM Businesses ORDER BY BusinessName ASC
        `);
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ message: "Error getting businesses", error: error.message });
    }
});

// ── SEARCH businesses ────────────────────────────────────────────
// app.get("/api/businesses/search", async (req, res) => {
//     const searchTerm = req.query.q || "";
//     try {
//         const pool   = await connectToDatabase();
//         const result = await pool.request()
//             .input("SearchTerm", sql.NVarChar, `%${searchTerm}%`)
//             .query(`
//                 SELECT BusinessID, BusinessName, BusinessType,
//                        City, State, Phone, Email, Website, ServicesOffered
//                 FROM Businesses
//                 WHERE BusinessName    LIKE @SearchTerm
//                    OR BusinessType    LIKE @SearchTerm
//                    OR City            LIKE @SearchTerm
//                    OR ServicesOffered LIKE @SearchTerm
//                 ORDER BY BusinessName ASC
//             `);
//         res.json(result.recordset);
//     } catch (error) {
//         res.status(500).json({ message: "Error searching", error: error.message });
//     }
// });
// ── SEARCH businesses ────────────────────────────────────────────
app.get("/api/businesses/search", async (req, res) => {
    const searchTerm = req.query.q || "";
    try {
        const pool   = await connectToDatabase();
        const result = await pool.request()
            .input("SearchTerm", sql.NVarChar, `%${searchTerm}%`)
            .query(`
                SELECT BusinessID, BusinessName, BusinessType,
                       City, State, Phone, Email, Website, ServicesOffered
                FROM Businesses
                WHERE BusinessName    LIKE @SearchTerm
                   OR BusinessType    LIKE @SearchTerm
                   OR City            LIKE @SearchTerm
                   OR ServicesOffered LIKE @SearchTerm
                ORDER BY BusinessName ASC
            `);
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ message: "Error searching", error: error.message });
    }
});
// ── ADD new business ─────────────────────────────────────────────
app.post("/api/businesses", async (req, res) => {
    const { BusinessName, BusinessType, City, State,
            Phone, Email, Website, ServicesOffered } = req.body;
    try {
        const pool = await connectToDatabase();
        await pool.request()
            .input("BusinessName",    sql.NVarChar, BusinessName)
            .input("BusinessType",    sql.NVarChar, BusinessType)
            .input("City",            sql.NVarChar, City)
            .input("State",           sql.NVarChar, State)
            .input("Phone",           sql.NVarChar, Phone)
            .input("Email",           sql.NVarChar, Email)
                        .input("Website",         sql.NVarChar, Website)
            .input("ServicesOffered", sql.NVarChar, ServicesOffered)
            .query(`
                INSERT INTO Businesses
                (BusinessName,BusinessType,City,State,Phone,Email,Website,ServicesOffered)
                VALUES
                (@BusinessName,@BusinessType,@City,@State,@Phone,@Email,@Website,@ServicesOffered)
            `);
        res.json({ message: "Business added successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error adding business", error: error.message });
    }
});

// ── Start the server ─────────────────────────────────────────────
app.listen(process.env.PORT, () => {
    console.log(`Server running at http://localhost:${process.env.PORT}`);
});





