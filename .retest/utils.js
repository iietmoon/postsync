const fs = require('fs');
const path = require('path');
const postsync = require('../dist/index.js')

// Path to the JSON file
const filePath = path.join(__dirname, 'collections/postman-collection.json');

// Read JSON file
fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading file:', err);
        return;
    }
    
    try {
        const jsonData = JSON.parse(data);
        const api = postsync.createApiEndpoints(data);
        console.log(api.products.endpoints.get.getAllProducts());
      } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
    }
});