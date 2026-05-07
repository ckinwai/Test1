// Wait for Firebase and DOM to be ready
function initAuthModule() {
    if (typeof firebase === 'undefined') {
        console.error('Firebase not available yet');
        setTimeout(initAuthModule, 100);
        return;
    }

    const auth = firebase.auth();
    const authModal = document.getElementById('authModal');
    const authForm = document.getElementById('authForm');
    const authEmail = document.getElementById('authEmail');
    const authPassword = document.getElementById('authPassword');
    const signInBtn = document.getElementById('signInBtn');
    const signUpBtn = document.getElementById('signUpBtn');
    const authError = document.getElementById('authError');

    // Sign Up
    signUpBtn.addEventListener('click', async () => {
        const email = authEmail.value.trim();
        const password = authPassword.value;

        if (!email || !password) {
            authError.textContent = 'Please fill in all fields';
            return;
        }

        if (password.length < 6) {
            authError.textContent = 'Password must be at least 6 characters';
            return;
        }

        try {
            signUpBtn.disabled = true;
            signUpBtn.textContent = 'Creating...';
            await auth.createUserWithEmailAndPassword(email, password);
            authModal.classList.remove('active');
            loadApp();
        } catch (error) {
            authError.textContent = error.message;
        } finally {
            signUpBtn.disabled = false;
            signUpBtn.textContent = 'Create Account';
        }
    });

    // Sign In
    signInBtn.addEventListener('click', async () => {
        const email = authEmail.value.trim();
        const password = authPassword.value;

        if (!email || !password) {
            authError.textContent = 'Please fill in all fields';
            return;
        }

        try {
            signInBtn.disabled = true;
            signInBtn.textContent = 'Signing in...';
            await auth.signInWithEmailAndPassword(email, password);
            authModal.classList.remove('active');
            loadApp();
        } catch (error) {
            authError.textContent = error.message;
        } finally {
            signInBtn.disabled = false;
            signInBtn.textContent = 'Sign In';
        }
    });

    // Auth State Change
    auth.onAuthStateChanged((user) => {
        if (user) {
            loadApp();
        } else {
            authModal.classList.add('active');
        }
    });

    // Logout
    function logout() {
        auth.signOut().then(() => {
            authEmail.value = '';
            authPassword.value = '';
            authError.textContent = '';
            authModal.classList.add('active');
        });
    }

    console.log('Auth module initialized');
}

// Start auth module when window loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuthModule);
} else {
    initAuthModule();
}
