

// Fetch the Unsplash access key from the server
async function getAccessKey() {
    const response = await fetch('/api/access-key');
    const data = await response.json();
    return data.accessKey;
}

// Use the access key when fetching images
async function fetchImages(query, token = null) {
    const accessKey = await getAccessKey(); // Fetch the access key
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    const response = await fetch(`https://api.unsplash.com/search/photos?query=${query}&client_id=${accessKey}`, {
        headers
    });
    const data = await response.json();
    return data.results;
}

// Function to display images in the gallery
function displayImages(images) {
    const gallery = document.getElementById('gallery');
    gallery.innerHTML = ''; // Clear any previous images

    images.forEach(image => {
        const imgElement = document.createElement('img');
        imgElement.src = image.urls.small;
        imgElement.alt = image.alt_description; // Add alt text for accessibility
        gallery.appendChild(imgElement);
    });
}

// Get references to the search input and button
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const gallery = document.getElementById('gallery'); // Reference to the gallery

// Function to show authenticated UI
function showAuthenticatedUI() {
    searchButton.style.display = 'inline'; // Show the search button
    gallery.style.display = 'grid'; // Show the gallery
}

// Event listener for the search button click
searchButton.addEventListener('click', () => {
    const query = searchInput.value.trim(); // Get the search term
    if (query) { // Check if the query is not empty
        fetchImages(query).then(images => displayImages(images));
    }
});

// Optional: Event listener for the "Enter" key press
searchInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        searchButton.click(); // Trigger the button click
    }
});

// OAuth 2.0 handling
function getQueryParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Check if redirected with an authorization code
const code = getQueryParameter('code');
if (code) {
    exchangeCodeForToken(code).then(token => {
        localStorage.setItem('access_token', token);
        showAuthenticatedUI(); // Show the authenticated UI
        // Fetch and display default images with the user's access token
        fetchImages('Racoon burglar', token).then(images => displayImages(images));
    });
}

// Function to exchange the authorization code for an access token
async function exchangeCodeForToken(code) {
    const response = await fetch('https://unsplash.com/oauth/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            client_id: 'YOUR_CLIENT_ID',
            client_secret: 'YOUR_CLIENT_SECRET',
            redirect_uri: 'http://localhost:3000/callback',
            code: code,
            grant_type: 'authorization_code'
        })
    });

    const data = await response.json();
    return data.access_token;
}

// Check for existing access token on page load
const existingToken = localStorage.getItem('access_token');
if (existingToken) {
    showAuthenticatedUI(); // Show the authenticated UI if already logged in
}

// Search and display default images on page load
fetchImages('Racoon burglar').then(images => displayImages(images));

/* // Basic JavaScript to interact with the page
document.getElementById("clickMe").addEventListener("click", function () {
    alert("Button clicked!");
  }); */