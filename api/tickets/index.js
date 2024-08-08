const express = require('express');
const ticketApi = express.Router();
const fs = require('fs');
const { v4: uuidv4 } = require('uuid'); 


const validStatuses = ["OPEN", "CLOSE"];

const validateTicket = (ticket) => {
    const { title, description, team, status, assignee, reporter } = ticket;

    return (
        typeof title === 'string' && title.trim() !== '' &&
        typeof description === 'string' && description.trim() !== '' &&
        typeof team === 'string' && team.trim() !== '' &&
        validStatuses.includes(status.toUpperCase()) && 
        typeof assignee === 'string' && assignee.trim() !== '' &&
        typeof reporter === 'string' && reporter.trim() !== ''
    );
};

//read
ticketApi.get("/", (req, res) => {
    const data = fs.readFileSync('./api/tickets/ticketdetails.txt', 'utf8');
    const tickets = JSON.parse(data);
    res.status(200).json(tickets);
});


ticketApi.get("/:id", (req, res) => {
    const ticketId=req.params.id;
    const data = fs.readFileSync('./api/tickets/ticketdetails.txt', 'utf8');
    const tickets = JSON.parse(data);

    const ticket = tickets.find(t => t.id ===  ticketId);

    if (ticket) {
        res.status(200).json(ticket);
    } else {
        res.status(404).json({ error: 'Ticket not found' });
    }
});


// create
ticketApi.post('/', (req, res) => {
    const data = fs.readFileSync('./api/tickets/ticketdetails.txt', 'utf8');
    const tickets = JSON.parse(data);
    const newTicket = req.body;

    // valid
    if (!validateTicket(newTicket)) {
         res.status(400).json({ Invalid: 'Invalid ticket give valid data and empty values are not allowed also check the status open or close', details: req.body });
    }
    const titleExists = tickets.some(ticket => 
        ticket.title === newTicket.title 
    );

    const descriptionExists = tickets.some(ticket => 
        ticket.description === newTicket.description
    );

    const teamExists = tickets.some(ticket => 
        ticket.team === newTicket.team
    );

    if (titleExists&&teamExists&&descriptionExists) {
        res.status(400).json({ TicketExist: 'Ticket with this title already exists' });
    }


    
    newTicket.id = uuidv4();
    tickets.push(newTicket);
    fs.writeFileSync('./api/tickets/ticketdetails.txt', JSON.stringify(tickets, null, 2), 'utf8');
    res.status(201).json(newTicket);
});

// update
ticketApi.put('/:ticketId', (req, res) => {
    const ticketId = req.params.ticketId;
    const data = fs.readFileSync('./api/tickets/ticketdetails.txt', 'utf8');
    const tickets = JSON.parse(data);
    const updatedTicket = req.body;

    
    if (!validateTicket(updatedTicket)) {
        res.status(400).json({ Invalid: 'Invalid ticket give valid data and empty values are not allowed also check the status open or close', details: req.body });
    }

    
    const titleExists = tickets.some(ticket => 
        ticket.title === updatedTicket.title && ticket.id !== ticketId
    );

    const descriptionExists = tickets.some(ticket => 
        ticket.description === updatedTicket.description && ticket.id !== ticketId
    );

    const teamExists = tickets.some(ticket => 
        ticket.team === updatedTicket.team && ticket.id !== ticketId
    );

    if (titleExists&&teamExists&&descriptionExists) {
         res.status(400).json({ TicketExist: 'Ticket with this title already exists' });
    }

    
    const index = tickets.findIndex(ticket => ticket.id === ticketId);
    if (index === -1) {
         res.status(404).json({ Ticket: 'Ticket not found' });
    }

    tickets[index] = { ...tickets[index], ...updatedTicket };
    fs.writeFileSync('./api/tickets/ticketdetails.txt', JSON.stringify(tickets, null, 2), 'utf8');
    res.status(200).json(tickets[index]);
});

// delete
ticketApi.delete('/:ticketId', (req, res) => {
    const ticketId = req.params.ticketId;
    const data = fs.readFileSync('./api/tickets/ticketdetails.txt', 'utf8');
    const tickets = JSON.parse(data);

    
    const index = tickets.findIndex(ticket => ticket.id === ticketId);
    if (index === -1) {
        res.status(404).json({ Ticket: 'Ticket not found' });
    }

    tickets.splice(index, 1);
    fs.writeFileSync('./api/tickets/ticketdetails.txt', JSON.stringify(tickets, null, 2), 'utf8');
    res.status(200).json({ message: 'Ticket deleted successfully' });
});

module.exports = ticketApi;
