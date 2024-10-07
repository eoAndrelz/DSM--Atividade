const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const handlebars = require('express-handlebars').engine;

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const serviceAccount = require('./serviceAccountKey.json');

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();

app.engine('handlebars', handlebars({
    helpers: {
      eq: function (v1, v2) {
        return v1 === v2;
      }
    }
  }));
app.set('view engine', 'handlebars');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", function (req, res) {
    res.render('primeira_pagina');
});

app.post("/cadastrar", function (req, res) {
    db.collection('clientes').add({
        nome: req.body.nome,
        telefone: req.body.telefone,
        origem: req.body.origem,
        data_contato: req.body.data_contato,
        observacao: req.body.observacao
    }).then(function () {
        console.log("Dados cadastrados com sucesso!");
        res.redirect("/consultar");
    }).catch(function (error) {
        console.error("Erro ao cadastrar: ", error);
        res.status(500).send("Erro ao cadastrar dados.");
    });
});

app.get("/consultar", function (req, res) {
    var posts = []
    db.collection('clientes').get().then(
        function(snapshot){
            snapshot.forEach(function(doc){
                const data = doc.data()
                data.id = doc.id
                posts.push(data)
            })
            console.log(posts)
            res.render('consulta', {posts: posts})
        }
    )
});


app.post("/atualizar", function (req, res) {
    const id = req.body.id;
    console.log("ID recebido:", id);

    const dadosAtualizados = {
        nome: req.body.nome,
        telefone: req.body.telefone,
        origem: req.body.origem,
        data_contato: req.body.data_contato,
        observacao: req.body.observacao
    };

    db.collection('clientes').doc(id).update(dadosAtualizados)
        .then(function () {
            console.log("Dados atualizados com sucesso!");
            res.redirect("/consultar");
        })
        .catch(function (error) {
            console.error("Erro ao atualizar: ", error);
            res.status(500).send("Erro ao atualizar dados.");
        });
});



app.get("/editar/:id", function (req, res) {
    var posts = []
    const id = req.params.id
    const clientes = db.collection('clientes').doc(id).get().then(
        function (doc) {
            const data = doc.data()
            data.id = doc.id
            posts.push(data)
            console.log({ posts: posts })
            res.render('editar', { posts: posts })
        }
    )
});

app.get("/excluir/:id", function (req, res) {
    const id = req.params.id;

    db.collection('clientes').doc(id).delete()
        .then(function () {
            console.log("Cliente excluído com sucesso!");
            res.redirect("/consultar");
        })
        .catch(function (error) {
            console.error("Erro ao excluir cliente: ", error);
            res.status(500).send("Erro ao excluir cliente.");
        });
});


app.listen(8081, function () {
    console.log("Servidor Ativo na porta 8081");
});