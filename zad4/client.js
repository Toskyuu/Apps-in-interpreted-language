const axios = require('axios');

const apiUrl = 'http://localhost:3000'; // Zmień na rzeczywisty adres API

async function getProductById(productId) {
    try {
        const response = await axios.get(`${apiUrl}/products/${productId}`);
        console.log('Dane produktu:', response.data);
    } catch (error) {
        console.error('Błąd podczas pobierania produktu:', error.response ? error.response.data : error.message);
    }
}

getProductById(6);
