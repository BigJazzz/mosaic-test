// Configuration
const APP_VERSION = "v1.2_Login_And_Version";
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyQa5kBNLClsI9anAfp3_VXePsT2Zzgp23Vh_Z33qtA0TenyNLj91zabO3Tym7BUE9VMQ/exec';

// DOM Elements
const loginSection = document.getElementById('login-section');
const mainAppSection = document.getElementById('main-app');
const loginForm = document.getElementById('login-form');
const loginStatus = document.getElementById('login-status');
const logoutBtn = document.getElementById('logout-btn');

/**
 * A helper function to make POST requests to the server.
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
        throw error;
    }
};

/**
 * Handles the login process.
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
            
            // Store session info
            document.cookie = `authToken=${result.token};max-age=604800;path=/;SameSite=Lax`;
            sessionStorage.setItem('attendanceUser', JSON.stringify(result.user));
            if (result.scriptVersion) {
                sessionStorage.setItem('scriptVersion', result.scriptVersion);
            }
            
            showMainApp();
            logVersions(); // Log versions after showing the app
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
    sessionStorage.removeItem('scriptVersion');
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

/**
 * Logs the frontend and backend script versions to the console.
 */
const logVersions = () => {
    console.info(`%c[VERSIONS] Frontend: ${APP_VERSION}`, 'color: blue; font-weight: bold;');
    const backendVersion = sessionStorage.getItem('scriptVersion');
    if (backendVersion) {
        console.info(`%c[VERSIONS] Backend:  ${backendVersion}`, 'color: green; font-weight: bold;');
    }
}

// --- Initial Load ---
document.addEventListener('DOMContentLoaded', () => {
    loginForm.addEventListener('submit', handleLogin);
    logoutBtn.addEventListener('click', handleLogout);

    const token = document.cookie.split('; ').find(row => row.startsWith('authToken='))?.split('=')[1];
    const user = sessionStorage.getItem('attendanceUser');

    if (token && user) {
        console.log('[CLIENT] User is already logged in.');
        showMainApp();
        logVersions(); // Log versions on initial load if already logged in
    } else {
        console.log('[CLIENT] User needs to log in.');
        showLogin();
        // Log only frontend version if not logged in
        console.info(`%c[VERSIONS] Frontend: ${APP_VERSION}`, 'color: blue; font-weight: bold;');
    }
});
