const express = require('express');
const mongoose = require('mongoose');
const body_parser = require('body-parser');
const bcrypt = require('bcryptjs');

const exp = express();
const bodyParser = body_parser;

exp.use(bodyParser.json());
exp.use(express.static('front'));
exp.use(bodyParser.urlencoded({
    extended: true,
}));

mongoose.connect('mongodb://localhost:27017/usersdb', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const db = mongoose.connection;

db.on('error', () => console.log('Database connection error'));
db.once('open', () => console.log('Database connected'));

exp.post('/signup', (req, res) => {
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const ref_no = req.body.ref_no;
    const e_mail = req.body.e_mail;
    const user_name = req.body.user_name;
    const password = req.body.password;

        const user_data = {
        "_id": ref_no,
        "first_name": first_name,
        "last_name": last_name,
        "e-mail": e_mail,
        "user_name": user_name,
        "password": password
    }

        db.collection('student').insertOne(user_data, (err, collection) => {
        if(err){
            throw err;
        }
        console.log('Record inserted successfully');
    });

        return res.redirect('login.html');
})

exp.get('/', (req, res) => {
    res.set({"Allow-access-Allow-Origin" : '*'})
    return res.redirect('signup.html');
}).listen(3000);

console.log('Listening from port 3000');