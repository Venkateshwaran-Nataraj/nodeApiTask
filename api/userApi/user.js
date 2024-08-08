const express = require('express');
const userApi = express.Router();
const fs = require('fs');
const { v4: uuidv4 } = require('uuid'); 
const phoneNocheck = /^[0-9]{10}$/;

function isValidEmail(email) {
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return emailRegex.test(email);
}


const validateUser = (user) => {
    const { firstname, lastname, emailId, phoneno, employeeId, designation, teamid} = user;
  
    return (
        typeof firstname === 'string' && firstname.trim() !== '' &&
        typeof lastname === 'string' && lastname.trim() !== '' &&
        isValidEmail(emailId) && 
        typeof phoneno === 'string' && phoneno.trim() !== '' &&  phoneNocheck.test(phoneno)&&
        typeof employeeId === 'string' && employeeId.trim() !== '' &&
        typeof designation === 'string' && designation.trim() !== '' &&
        typeof teamid === 'string' && teamid.trim() !== '' 
    );
};

//read
userApi.get('/', (req, res) => {
    const data = fs.readFileSync('./api/userApi/userdetails.txt', 'utf8');
    const users = JSON.parse(data);
    res.status(200).json(users);
});


userApi.get('/:id', (req, res) => {
    const userId=req.params.id;
    const data = fs.readFileSync('./api/userApi/userdetails.txt', 'utf8');
    const users = JSON.parse(data);

    const user=users.find(us=>us.id===userId)
    if(user)
    {
        res.status(200).json(user)
    }
    else {
        res.status(404).json({ User: 'User not found' });
    }

   
});




// create
userApi.post('/', (req, res) => {
    const data = fs.readFileSync('./api/userApi/userdetails.txt', 'utf8');
    const users = JSON.parse(data);
    const newUser = req.body;

   //validate
    if (!validateUser(newUser)) {
     res.status(400).json({ Invalid: 'Invalid user data check there is no empty values and email ,ph in correct format', details: req.body });
    }

   
    const userExists = users.some(user => user.emailId === newUser.emailId || (newUser.firstname && user.firstname === newUser.firstname));
    if (userExists) {
        res.status(400).json({ UserExist: 'User with this email or username already exists' });
    }

 
    newUser.id = uuidv4();
    users.push(newUser);
    fs.writeFileSync('./api/userApi/userdetails.txt', JSON.stringify(users, null, 2), 'utf8');
    res.status(201).json(newUser);
});

//update
userApi.put('/:userId', (req, res) => {
    const userId = req.params.userId;
    const data = fs.readFileSync('./api/userApi/userdetails.txt', 'utf8');
    const users = JSON.parse(data);
    const updatedUser = req.body;


    if (!validateUser(updatedUser)) {
         res.status(400).json({ Invalid: 'Invalid user data check there is no empty values and email ,ph in correct format', details: req.body });
    }

   
    const emailExists = users.some(user =>
        user.emailId === updatedUser.emailId && user.id !== userId
    );

  
    const firstnameExists = users.some(user =>
        user.firstname === updatedUser.firstname && user.id !== userId
    );
    const lastnameExists = users.some(user =>
        user.lastname === updatedUser.lastname && user.id !== userId
    );

    if (emailExists) {
         res.status(400).json({ EmailExist: 'User with this email already exists' });
    }

    if (firstnameExists && lastnameExists) {
         res.status(400).json({ UserExist: 'User with this username already exists' });
    }

   
    const index = users.findIndex(user => user.id === userId);
    if (index === -1) {
        res.status(404).json({ User: 'User not found' });
    }

  
    users[index] = { ...users[index], ...updatedUser };
    fs.writeFileSync('./api/userApi/userdetails.txt', JSON.stringify(users, null, 2), 'utf8');
    res.status(200).json(users[index]);
});


//delete
userApi.delete('/:userId', (req, res) => {
    const userId = req.params.userId;
    const data = fs.readFileSync('./api/userApi/userdetails.txt', 'utf8');
    const users = JSON.parse(data);


    const index = users.findIndex(user => user.id === userId);
    if (index === -1) {
     res.status(404).json({ User: 'User not found' });
    }

    users.splice(index, 1);
    console.log(users.splice(index, 1));
    
    fs.writeFileSync('./api/userApi/userdetails.txt', JSON.stringify(users, null, 2), 'utf8');
    console.log(users);
    
    res.status(200).json({ message: 'User deleted successfully' });
});

module.exports = userApi;
