const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');
const cors = require('cors');

const app = express();

// Update CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000', // Replace with your frontend URL
  methods: ['GET'],
  credentials: true
}));

// Function to fetch table data
async function fetchTableData() {
    try {
        const response = await axios.get('https://taikoscan.io/token/tokenholderchart/0xa9d23408b9ba935c230493c40c73824df71a0975');
        const html = response.data;

        const $ = cheerio.load(html);

        const tableRows = $('table tbody tr');
        const tableData = [];

        tableRows.each((index, row) => {
            const rowData = [];
            const cells = $(row).find('td');

            // Exclude the last cell if it exists
            cells.each((index, cell) => {
                if (index < cells.length - 1) {
                    rowData.push($(cell).text().trim());
                }
            });

            tableData.push(rowData);
        });

        return tableData;

    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

// Set up the /bot route
app.get('/bot', async (req, res) => {
    try {
        const data = await fetchTableData();
        res.json(data);
    } catch (error) {
        res.status(500).send('Error fetching table data');
    }
});

const PORT = process.env.PORT || 3000;
// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});