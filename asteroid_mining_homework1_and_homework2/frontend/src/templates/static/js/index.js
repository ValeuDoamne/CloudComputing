

function login_clicked() {
    location.href = '/login';
}

function dashboard_clicked() {
    location.href = '/dashboard';
}

window.onload = () => {
    if (localStorage.getItem('TOKEN') !== null) {
        const login_btn = document.getElementById('login-btn');
        login_btn.textContent = "Dashboard >>>"
        login_btn.onclick = dashboard_clicked;
    }
}
