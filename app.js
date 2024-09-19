const express = require('express');
const app = express();
const { engine } = require('express-handlebars');
const bodyParser = require('body-parser');
const cors = require('cors');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const morgan = require('morgan');

const serviceAccount = require('./serviceAccountKey.json');
initializeApp({
    credential: cert(serviceAccount),
});

const db = getFirestore();
db.settings({
    ignoreUndefinedProperties: true,
});

app.engine('handlebars', engine({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Routes
app.get('/', async (req, res) => {
    res.render("primeira_pagina");
});

app.post("/cadastrar", async (req, res) => {
    const { nome, telefone, origem, servico, endereco, email } = req.body;

    // Basic validation
    if (!nome || !telefone || !origem) {
        return res.status(400).send('Nome, Telefone, and Origem are required.');
    }

    const data = {
        nome: nome || null,
        telefone: telefone || null,
        origem: origem || null,
        email: email || null,
        status: 'Novo',
        servico: servico || null,
        endereco: endereco || null,
    };

    try {
        await db.collection('clientes').add(data);
        console.log('Dados cadastrados:', data);
        res.redirect('/');
    } catch (err) {
        console.error('Erro ao cadastrar: ', err);
        res.status(500).send('Erro ao cadastrar');
    }
});

// Start server
app.listen(8081, () => {
    console.log('Servidor rodando na url http://localhost:8081');
});
