const express =require('express');
const cors = require('cors');
const mysql = require('mysql');

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require("express-session")

const bcrypt = require("bcrypt")
const saltRounds = 10

const jwt = require('jsonwebtoken');

const app = express();

app.use(express.json());

app.use(cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true
}));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true})); // This has to be here, Dont know about its functionallity

app.use(session({
    key: "userId",
    secret: "subscribe",
    resave: false, // DK about this too
    saveUninitialized: false, // I dont know what this does but it should be there only
    cookie: {
        expires: 60*60*24,
    }
}))

const db = mysql.createPool({
    host : 'localhost',
    user : 'root',
    password : 'password',
    database : 'loginLogout'
});



app.post('/register', (req, res) =>{

    const username = req.body.username
    const password = req.body.password

    bcrypt.hash(password,saltRounds, (err, hash)=>{
       if(err){
           console.log(err)
       }     
        db.query("INSERT INTO employees (username, password) VALUES (?,?)", [username, hash], (err,result)=>{
            console.log(err,result)
         })
    })
    
})




const verifyJWT = (req, res, next)=>{
    const token = req.headers["x-access-token"]
    if(!token) {
        res.send("Need a Token here!")
    } else {
        jwt.verify(token, "jwtSecret", (err, decoded)=>{
            if (err) {
                res.json({
                    auth: false,
                    message: "Failed Authentication"
                })
            } else {
                req.userID = decoded.id;
                next();
            }
        })
    }
}



app.get('/isUserAuth',verifyJWT, (req, res)=>{
    res.send("Authenticated!")
})

app.get("/login", (req, res)=>{
    if (req.session.user) {
        res.send({loggedIn: true, user: req.session.user});
    } else {
        res.send({loggedIn: false});
    }
});         

app.post('/login', (req, res) =>{

    const username = req.body.username
    const password = req.body.password

    db.query("SELECT * FROM employees WHERE username = ?;", username, (err,result)=>{
        if (err){
            res.send({err: err});
        }
        if(result.length>0){
           bcrypt.compare(password, result[0].password, (error, response)=>{
               if (response) {
                   const id = result[0].id
                   const token = jwt.sign({id}, "jwtSecret", {
                       expiresIn: 300,
                   })
                   req.session.user = result;   
                   res.json({auth: true, token: token, result: result});
               } else {
                res.json({auth: false,message: "Invalid Combination"});
            }
           })
        } else {
            res.json({auth: false,message: "No user Exists"});
        }
        })
})


app.listen(3001,()=>{
    console.log("running on 3001 server")
})