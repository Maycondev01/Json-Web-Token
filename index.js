const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const jwt = require("jsonwebtoken");
const cors = require('cors');

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());

const JWTSecret = 'asfjnsafaszxkxzkga'

function auth(req,res,next) {
    const authToken = req.headers['authorization'];
    if(authToken != undefined) {
        const bearer = authToken.split(' ');
        var token = bearer[1];

        jwt.verify(token, JWTSecret, (err,data) => {
            if(err) {
                res.status(401);
                res.json({err: "Token Inválido"});
            } else {
                req.token = token;
                req.UserLogado = {id: data.id, email: data.email};
                next();
            }
        })
    } else {
        res.status(401);
        res.json({err: "Falha de Autenticação!"});
    }
    console.log(authToken)
}



var BD = {
    clientes: [
        {
            id: 1,
            nome: "Maycon",
            idade: 22,
            lugar: "Recife",
            produto: "Curso de Node.Js",
            preco: 29
        },
        {
            id: 2,
            nome: "Greice",
            idade: 20,
            lugar: "Joana Bezerra",
            produto: "Maquiagem",
            preco: 100
        },
        {
            id: 3,
            nome: "Matheus",
            idade: 25,
            lugar: "Ignez Andreaza",
            produto: "Livro",
            preco: 80
        }
    ],
    usuario: [
        {
            id: 1,
            name: "Maycon Douglas",
            email: "maycon@gmail.com",
            senha: "123456"
        },
        {
            id: 2,
            name: "Greice",
            email: "greice@hotmail.com",
            senha: "12345"
        }
    ]
}

app.get("/clientes", auth, (req,res) => { // Ver todos os clientes
    res.statusCode = 200;
    res.json(BD.clientes)
})

app.get("/clientes/:id", auth, (req,res) => { // Ver Cliente por Id
    if(isNaN(req.params.id)) {
        res.sendStatus(400);
    } else {
        var id = parseInt(req.params.id);

        var clientes = BD.clientes.find(cliente => cliente.id == id);

        if(clientes != undefined) {
            res.statusCode = 200;
            res.json(clientes)
        } else {
            res.sendStatus(404)
        }
    }
})

app.post("/cliente", auth, (req,res) => { // Adicionar Novo Cliente
    var {nome, idade, lugar, produto, preco} = req.body;

    if(nome == undefined && idade == undefined && lugar == undefined && produto == undefined && preco == undefined) {
        res.sendStatus(400)
    } else {
        BD.clientes.push({
            id: 4,
            nome,
            idade,
            lugar,
            produto,
            preco
        });
    }
    res.sendStatus(200);
})

app.delete("/cliente/:id", auth, (req,res) => { // Deletar Cliente
    if(isNaN(req.params.id)) {
        res.sendStatus(400);
    } else {
        var id = parseInt(req.params.id);
        var indice = BD.clientes.findIndex(cliente => cliente.id == id);

        if(indice == undefined) {
            res.sendStatus(404);
        } else {
            BD.clientes.splice(indice, 1);
            res.sendStatus(200)
        }
    }
})

app.put("/cliente/:id", auth, (req,res) => { // Editar Clientes
    if(isNaN(req.params.id)) {
        res.sendStatus(400);
    } else {
        var id = parseInt(req.params.id);
        var cliente = BD.clientes.find(client => client.id == id);

        if(cliente != undefined) {
            var {nome, idade, lugar,produto,preco} = req.body;

            if(nome != undefined) {
                cliente.nome = nome;
            }
            if(idade != undefined) {
                cliente.idade = idade;
            }
            if(lugar != undefined) {
                cliente.lugar = lugar;
            }
            if(produto != undefined) {
                cliente.produto = produto;
            }
            if(preco != undefined) {
                cliente.preco = preco;
                if(preco == isNaN) {
                    res.statusCode = 400;
                    res.sendStatus(400);
                } else {
                    res.sendStatus(200)
                }
            }
        } else {
            res.sendStatus(400);
        }
    }
})

// Autenticação de Usuário:
app.post("/autenticacao", (req,res) => {
    var { email, senha } = req.body;

    if(email != undefined) {
        var user = BD.usuario.find(users => users.email == email);

        if(user != undefined) {
            if(user.senha == senha) {
                jwt.sign({id: user.id, email: user.email}, JWTSecret, {expiresIn: '48h'}, (err,token) => {
                    if(err) {
                        res.status(400);
                        res.json({err: "Houve um erro de autenticação!"})
                    } else {
                        res.status(200);
                        res.json({token: token})
                    }
                })
            } else {
                res.status(404);
                res.json({erro: "Sua senha está incorreta!"})
            }
        } else {
            res.sendStatus(400);
            res.json({err: "Houve algum erro"});
        }
    }
})


app.listen(3000, function(err) {
    if(err) {
        console.log(err)
    } else {
        console.log("Servidor Online!");
    }
})

