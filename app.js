// Configuration
const APP_VERSION = "v1.4_Intensive_Logging";
const APPS_SCRIPT_URL = 'YOUR_NEW_DEPLOYMENT_URL_HERE'; // <-- PASTE YOUR NEW URL

console.log(`[CLIENT LOG] app.js loaded. Version: ${APP_VERSION}.`);

// DOM Elements
console.log('[CLIENT LOG] Getting DOM elements.');
const loginSection = document.getElementById('login-section');
const mainAppSection = document.getElementById('main-app');
const loginForm = document.getElementById('login-form');
const loginStatus = document.getElementById('login-status');
const logoutBtn = document.getElementById('logout-btn');
console.log('[CLIENT LOG] DOM elements retrieved.');

/**
 * A helper function to make POST requests to the server.
 */
const postToServer = async (body) => {
    console.log('[CLIENT LOG] postToServer: Function started.');
    console.log('[CLIENT LOG] postToServer: Body to be sent:', body);
    console.log('[CLIENT LOG] postToServer: Target URL:', APPS_SCRIPT_URL);

    try {
        console.log('[CLIENT LOG] postToServer: About to execute fetch...');
        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        console.log('[CLIENT LOG] postToServer: Fetch executed. Response received from server.');

        if (!response.ok) {
            console.error('[CLIENT LOG] postToServer: Network response was not ok. Status:', response.status);
            const errorText = await response.text();
            console.error('[CLIENT LOG] postToServer: Error text from server:', errorText);
            throw new Error(`Network error: ${response.statusText} - ${errorText}`);
        }

        console.log('[CLIENT LOG] postToServer: Response is OK. Parsing JSON...');
        const jsonResponse = await response.json();
        console.log('[CLIENT LOG] postToServer: JSON parsed successfully.', jsonResponse);
        return jsonResponse;
    } catch (error) {
        console.error('[CLIENT LOG] postToServer: A critical error occurred during fetch.', error);
        throw error;
    }
};

/**
 * Handles the login process.
 */
const handleLogin = async (event) => {
    console.log('[CLIENT LOG] handleLogin: Function started.');
    event.preventDefault();
    console.log('[CLIENT LOG] handleLogin: Form submission prevented.');
    loginStatus.textContent = 'Logging in...';
    loginStatus.style.color = '#333';

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    console.log(`[CLIENT LOG] handleLogin: Captured username: "${username}".`);

    if (!username || !password) {
        console.error('[CLIENT LOG] handleLogin: Username or password missing.');
        loginStatus.textContent = 'Username and password are required.';
        loginStatus.style.color = 'red';
        return;
    }

    try {
        console.log('[CLIENT LOG] handleLogin: Calling postToServer.');
        const result = await postToServer({ action: 'loginUser', username, password });
        console.log('[CLIENT LOG] handleLogin: postToServer returned a result.', result);

        if (result.success && result.token) {
            console.log('[CLIENT LOG] handleLogin: Login was successful according to the server.');
            loginStatus.textContent = 'Login successful!';
            loginStatus.style.color = 'green';
            sessionStorage.setItem('attendanceUser', JSON.stringify(result.user));
            if (result.scriptVersion) {
                sessionStorage.setItem('scriptVersion', result.scriptVersion);
            }
            showMainApp();
            logVersions();
        } else {
            console.error('[CLIENT LOG] handleLogin: Server responded with an error or invalid data.');
            throw new Error(result.error || 'Invalid username or password.');
        }
    } catch (error) {
        console.error('[CLIENT LOG] handleLogin: An error occurred during the login process.', error);
        loginStatus.textContent = `Login failed: ${error.message}`;
        loginStatus.style.color = 'red';
    }
    console.log('[CLIENT LOG] handleLogin: Function finished.');
};

/**
 * Handles the logout process.
 */
const handleLogout = () => {
    console.log('[CLIENT LOG] handleLogout: Function started.');
    sessionStorage.removeItem('attendanceUser');
    sessionStorage.removeItem('scriptVersion');
    document.cookie = 'authToken=; max-age=0; path=/;';
    showLogin();
    console.log('[CLIENT LOG] handleLogout: Session cleared and login screen shown.');
};

const showMainApp = () => {
    console.log('[CLIENT LOG] showMainApp: Hiding login, showing main app.');
    loginSection.classList.add('hidden');
    mainAppSection.classList.remove('hidden');
};

const showLogin = () => {
    console.log('[CLIENT LOG] showLogin: Hiding main app, showing login.');
    mainAppSection.classList.add('hidden');
    loginSection.classList.remove('hidden');
};

const logVersions = () => {
    console.info(`%c[VERSIONS] Frontend: ${APP_VERSION}`, 'color: blue; font-weight: bold;');
    const backendVersion = sessionStorage.getItem('scriptVersion');
    if (backendVersion) {
        console.info(`%c[VERSIONS] Backend:  ${backendVersion}`, 'color: green; font-weight: bold;');
    }
}

// --- Initial Load ---
document.addEventListener('DOMContentLoaded', () => {
    console.log('[CLIENT LOG] DOMContentLoaded: Page loaded.');
    loginForm.addEventListener('submit', handleLogin);
    logoutBtn.addEventListener('click', handleLogout);
    console.log('[CLIENT LOG] DOMContentLoaded: Event listeners attached.');

    const token = document.cookie.split('; ').find(row => row.startsWith('authToken='))?.split('=')[1];
    const user = sessionStorage.getItem('attendanceUser');
    console.log(`[CLIENT LOG] DOMContentLoaded: Checking for existing session. Token found: ${!!token}, User found: ${!!user}`);

    if (token && user) {
        console.log('[CLIENT LOG] DOMContentLoaded: User is already logged in.');
        showMainApp();
        logVersions();
    } else {
        console.log('[CLIENT LOG] DOMContentLoaded: User needs to log in.');
        showLogin();
        console.info(`%c[VERSIONS] Frontend: ${APP_VERSION}`, 'color: blue; font-weight: bold;');
    }
    console.log('[CLIENT LOG] DOMContentLoaded: Initial setup complete.');
});
