const express = require('express');
const mongoose = require('mongoose');
const body_parser = require('body-parser');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

const exp = express();
const bodyParser = body_parser;

exp.use(bodyParser.json());
exp.use(express.static('front'));
exp.use(bodyParser.urlencoded({
    extended: true,
}));

mongoose.connect('mongodb://localhost:27017/studentsdb', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const db = mongoose.connection;

db.on('error', () => console.log('Database connection error'));
db.once('open', () => console.log('Database connected'));


const userSchema = Schema ({
    ref_no: {type: Number, required: true},
    first_name: {type: String, required: true},
    last_name: {type: String, required: true},
    email: {type: String, required: true},
    username : {type: String, required: true, unique: true},
    password: {type: String, required: true},
},  {collection: 'Student' })

const User = mongoose.model('User', userSchema);

exp.post('/signup', async (req, res) => {
    const {ref_no, first_name, last_name, email, username, password: plainPassword, password2} = req.body;

    if (!ref_no || !first_name || !email || !username || !plainPassword || !password2) {
        return res.json('Please fill in all the fields');
    }

    if (plainPassword !== password2) {
        return res.json('Password does not match Confirmation Password');
        }

    if (plainPassword.length < 8) {
        return res.json('Password too short. Should be at least 8 characters');    
        }

    const password = await bcrypt.hash(plainPassword, 10);

    try {
        const response = await User.create({
        ref_no, first_name, last_name, email, username, password
        })
        console.log('User created successfuly: ', response)
        return res.redirect('login.html');
    }catch (error){
        if (error.code === 11000) {
            return res.json('Username already registered')
        }
        throw error
    }
})

exp.post('/login', async (req, res) => {
    const {username, password} = req.body;
    const user = await User.findOne({username: username});

    if (!user){
        return res.json('Invalid username or password')
    }

    if (await bcrypt.compare(password, user.password)) {
        return res.redirect('dashboard.html');
    }
    res.json('Invalid username or password');    
})

exp.get('/', (req, res) => {
    res.set({"Allow-access-Allow-Origin" : '*'})
    return res.redirect('signup.html');
}).listen(3000);

console.log('Listening from port 3000');


