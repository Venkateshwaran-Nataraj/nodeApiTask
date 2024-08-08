const express = require('express');
const teamsApi = express.Router();
const fs = require('fs');
const { v4: uuidv4 } = require('uuid'); 

teamsApi.use(express.json());

const validateTeam = (team) => {
    const { team: teamName, member } = team;
    return (
        typeof teamName === 'string' && teamName.trim() !== '' &&
        typeof member === 'string' && member.trim() !== ''
    );
};


const isDuplicateTeamName = (teams, teamName, excludeId = null) => {
    return teams.some(team => 
        team.team.toUpperCase().trim() === teamName.toUpperCase().trim() && team.id !== excludeId
    );
};
const isDuplicateTeamNamePut = (teams, teamName, teamId) => {
    return teams.some(team => 
        team.team.toUpperCase().trim() === teamName.toUpperCase().trim() && team.id !== teamId
    );
};

// read
teamsApi.get('/', (req, res) => {
    const data = fs.readFileSync('./api/teamApi/teamDetails.txt', 'utf8');
    const jsonData = JSON.parse(data);
    res.status(200).json(jsonData);
});

teamsApi.get('/:id', (req, res) => {
    const teamId = req.params.id;
    const data = fs.readFileSync('./api/teamApi/teamDetails.txt', 'utf8');
    const teams = JSON.parse(data);
    

    const team = teams.find(t => t.id === teamId);

    if (team) {
        res.status(200).json(team);
    } else {
        res.status(404).json({ error: 'Team not found' });
    }
});






// create
teamsApi.post('/', (req, res) => {
    const data = fs.readFileSync('./api/teamApi/teamDetails.txt', 'utf8');
    const teams = JSON.parse(data);
    const newTeam = req.body;

    
    if (!validateTeam(newTeam)) {
        res.status(400).json({ Invalid: 'Invalid team data', details: req.body });
    }

   
    if (isDuplicateTeamName(teams, newTeam.team)) {
        res.status(400).json({TeamExist: 'Team with this name already exists' });
    }

   
    newTeam.id = uuidv4();
    teams.push(newTeam);
    fs.writeFileSync('./api/teamApi/teamDetails.txt', JSON.stringify(teams, null, 2), 'utf8');
    res.status(201).json(newTeam);
});

//update
teamsApi.put('/:teamId', (req, res) => {
    const teamId = req.params.teamId;
    const data = fs.readFileSync('./api/teamApi/teamDetails.txt', 'utf8');
    const teams = JSON.parse(data);
    const updatedTeam = req.body;

  
    if (!validateTeam(updatedTeam)) {
         res.status(400).json({ Invalid: 'Invalid team data', details: req.body });
    }

    
    const existingTeam = teams.find(team => 
        team.team.toUpperCase().trim() === updatedTeam.team.toUpperCase().trim() && team.id !== teamId
    );
    if (existingTeam) {
       
         res.status(200).json({ ExistingTeam: 'Team with this name already exists please check team and add your member there' });
    }

    if (isDuplicateTeamNamePut(teams, updatedTeam.team,teamId)) {
        res.status(400).json({ Duplicate: 'Team with this name already exists' });
    }


  

   
    const index = teams.findIndex(team => team.id === teamId);
    if (index === -1) {
        res.status(404).json({ Team: 'Team not found' });
    }

    
    teams[index] = { ...teams[index], ...updatedTeam };
    fs.writeFileSync('./api/teamApi/teamDetails.txt', JSON.stringify(teams, null, 2), 'utf8');
    res.status(200).json(teams[index]);
});

// delete
teamsApi.delete('/:teamId', (req, res) => {
    const teamId = req.params.teamId;
    const data = fs.readFileSync('./api/teamApi/teamDetails.txt', 'utf8');
    const teams = JSON.parse(data);

   
    const index = teams.findIndex(team => team.id === teamId);
    if (index === -1) {
        res.status(404).json({ Team: 'Team not found' });
    }

    teams.splice(index, 1);
    fs.writeFileSync('./api/teamApi/teamDetails.txt', JSON.stringify(teams, null, 2), 'utf8');
    res.status(200).json({ message: 'Team deleted successfully' });
});

module.exports = teamsApi;
