const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');
const cors = require('cors');


const app = express();
const port = 5000; // or any other port you prefer
app.use(cors()); // Allow all origins

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

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`)
});