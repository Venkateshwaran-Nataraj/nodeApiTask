const express = require('express');
const ticketApis = require('./api/tickets');
const teamsApi = require('./api/teamApi/team');
const userApi=require('./api/userApi/user');

const app = express();


app.use(express.json());


app.use('/tickets', ticketApis);
app.use('/teams', teamsApi);
app.use('/user',userApi);

app.listen(4000, (error) => {
    if (error) {
        console.error('Server start failed:', error);
    } else {
        console.log('Server started on port 4000');
    }
});
