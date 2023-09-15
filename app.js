const express = require("express");
const { login, updatePassword, searchEmail } = require("./functions/requests");
const app = express();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const port = process.env.PORT || 3000;
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
})
app.use(express.json());

app.get('/', (req, res) => {
    res.send("Bem vindo a minha API");
})
app.post('/searchEmail', async (req, res) => {
    console.log(req)
    try {
        const body = req.body;
        console.log(body);
        console.log(body.email);
        const email = await searchEmail(body.email);
        res.status(200).json({ message: email });   
    } 
    catch (e) { 
            res.status(500).json({ message: e });
}});

app.post('/login', async (req, res) => {
    try {
        const body = req.body;
        const user = await login(body.email, body.password);

        if (!user) {
            res.status(401).json({ message: 'Credenciais inválidas' });
            return;
        }
        const token = jwt.sign({ userId: user.id }, 'chave-secreta', { expiresIn: '1h' });
        res.setHeader('Authorization', `Bearer ${token}`);
        res.status(200).json({ message: 'Login bem-sucedido', token });
    } catch (e) {
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
})

app.post('/updatePassword', async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        jwt.verify(token, 'chave-secreta', async (err, decodedToken) => {
            if (err) {
                res.status(401).json({ message: 'Token inválido' });
                return;
            }

            const userId = decodedToken.userId;
            await updatePassword(userId, newPassword);

            res.json({ message: 'Senha atualizada com sucesso' });
        });
    } catch (e) {
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
})

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
})