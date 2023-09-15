const sql = require("mssql");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

const secretKey = 'asodasoi12309sadnjifdsiuojh321';

const config = {
    server: 'vwcsc018',
    database: 'DWJMEQP',
    domain: "grupo",
    user: "gustavosr",
    password: "ggg+++222---",
    options: {
        encrypt: true,
        trustServerCertificate: true,
    },
};

const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();

async function searchEmail(email) {
    try {
        await poolConnect;
        const req = pool.request();
        const result = await req.query(`SELECT Email FROM dAcessoUsuarios WHERE Email = '${email}'`);
        console.log(result.recordset[0])
        return result.recordset[0];
    } catch (e) {
        return e;
    } finally {
        pool.close();
    }
}

async function login(email, password) {
    try {
        await poolConnect;
        const user = await searchEmail(email);

        if (!user) {
            console.log("Email não encontrado");
            return false;
        }

        // Comparar a senha fornecida com o hash da senha armazenada
        const isPasswordValid = await bcrypt.compare(password, user.Password);

        if (isPasswordValid) {
            // Gere um token JWT para autenticar o usuário
            const payload = {
                user: user.Email,
            };
            const token = jwt.sign(payload, secretKey, { expiresIn: '365d' });

            return token;
        } else {
            console.log("Senha incorreta");
            return false;
        }
    } catch (e) {
        console.log(e);
        return false;
    } finally {
        pool.close();
    }
}

async function updatePassword(email, senha) {
    try {
        await poolConnect;
        const req = pool.request();
        const hashedPassword = await bcrypt.hash(senha, 10);

        const result = await req.query(`UPDATE dAcessoUsuarios SET Password = '${hashedPassword}', Date_Last_Update = GETDATE() WHERE Email = '${email}'`);
       
        console.log("Senha alterada");
    } catch (e) {
        console.log(e);
    } finally {
        pool.close();
    }
}

module.exports = {searchEmail, updatePassword, login}