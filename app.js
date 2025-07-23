// Configuration
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwXo8mCsBgpX45bUmAD70uGVFgu1FaUoS_JupeWlSXi6W6__b8JqWpeCzX3Yxnlm0I6Qw/exec';

// DOM Elements
const loginSection = document.getElementById('login-section');
const mainAppSection = document.getElementById('main-app');
const loginForm = document.getElementById('login-form');
const loginStatus = document.getElementById('login-status');
const logoutBtn = document.getElementById('logout-btn');

/**
 * A helper function to make POST requests to the server.
 * @param {object} body The data to send in the request body.
 * @returns {Promise<object>} The JSON response from the server.
 */
const postToServer = async (body) => {
    console.log('[CLIENT] Sending data to server:', body);
    try {
        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Network error: ${response.statusText} - ${errorText}`);
        }

        const jsonResponse = await response.json();
        console.log('[CLIENT] Received response from server:', jsonResponse);
        return jsonResponse;
    } catch (error) {
        console.error('[CLIENT] Error in postToServer:', error);
        throw error; // Re-throw the error to be caught by the caller
    }
};

/**
 * Handles the login process.
 * @param {Event} event The form submission event.
 */
const handleLogin = async (event) => {
    event.preventDefault();
    loginStatus.textContent = 'Logging in...';
    loginStatus.style.color = '#333';

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    if (!username || !password) {
        loginStatus.textContent = 'Username and password are required.';
        loginStatus.style.color = 'red';
        return;
    }

    try {
        const result = await postToServer({ action: 'loginUser', username, password });

        if (result.success && result.token) {
            console.log('[CLIENT] Login successful.');
            loginStatus.textContent = 'Login successful!';
            loginStatus.style.color = 'green';
            document.cookie = `authToken=${result.token};max-age=604800;path=/;SameSite=Lax`;
            sessionStorage.setItem('attendanceUser', JSON.stringify(result.user));
            showMainApp();
        } else {
            throw new Error(result.error || 'Invalid username or password.');
        }
    } catch (error) {
        console.error('[CLIENT] Login failed:', error);
        loginStatus.textContent = `Login failed: ${error.message}`;
        loginStatus.style.color = 'red';
    }
};

/**
 * Handles the logout process.
 */
const handleLogout = () => {
    console.log('[CLIENT] Logging out.');
    sessionStorage.removeItem('attendanceUser');
    document.cookie = 'authToken=; max-age=0; path=/;';
    showLogin();
};

/**
 * Shows the main application section and hides the login section.
 */
const showMainApp = () => {
    loginSection.classList.add('hidden');
    mainAppSection.classList.remove('hidden');
};

/**
 * Shows the login section and hides the main application section.
 */
const showLogin = () => {
    mainAppSection.classList.add('hidden');
    loginSection.classList.remove('hidden');
};

// --- Initial Load ---
document.addEventListener('DOMContentLoaded', () => {
    loginForm.addEventListener('submit', handleLogin);
    logoutBtn.addEventListener('click', handleLogout);

    const token = document.cookie.split('; ').find(row => row.startsWith('authToken='))?.split('=')[1];
    const user = sessionStorage.getItem('attendanceUser');

    if (token && user) {
        console.log('[CLIENT] User is already logged in.');
        showMainApp();
    } else {
        console.log('[CLIENT] User needs to log in.');
        showLogin();
    }
});