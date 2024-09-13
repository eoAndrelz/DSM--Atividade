const express = require('express')
const app = express()
const handlebars = require("express-handlebars").engine
const bodyParser = require("body-parser")
require('./models/banco')
const post = require('./models/post')
const { where } = require('sequelize')

app.engine("handlebars", handlebars({ defaultLayout: "main" }))
app.set("view engine", "handlebars")

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.get("/", (req, res) => {
    res.render('primeira_pagina')
})

app.get("/consulta", (req, res) => {
    post.Agendamentos.findAll()
    .then((posts) => {
        res.render('consulta', {posts: posts})
    }) 
    .catch((error) => {
        console.error('Não foi possivel buscar os dados', error);
    })
})

app.get("/editar/:id", (req, res) => {
    post.Agendamentos.findAll({ where:{"id": req.params.id} })
    .then((post) => {
        res.render("editar", {post:post})
    })
    .catch((error) => {
        console.error('Não foi possivel buscar os dados', error);
    })
})
app.post("/editar-usuario/:id", (req, res) => {
    post.Agendamentos.update({ ...req.body },{ where:{"id": req.params.id}}).then(() => {
        res.redirect('/consulta')
    })
})
app.get("/excluir/:id", (req, res) => {
    post.Agendamentos.destroy({where:{"id": req.params.id}})
    .then(() => {
        res.redirect('/consulta')
    }) 
})

app.post("/cadastrar", (req, res) => {
    post.Agendamentos.create(req.body)
    .then(() => {
        res.redirect('/consulta')
    })
    .catch((erro) => {
        res.send(erro)
    })
})

app.listen(8081, () => {
    console.log('Rodando na porta 8081');
})