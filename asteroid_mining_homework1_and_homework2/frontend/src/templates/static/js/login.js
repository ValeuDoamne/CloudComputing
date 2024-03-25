
async function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    let res = await fetch("/api/v1/users/login", 
        {
            method: "POST", 
            body: JSON.stringify({username, password}),
            headers: {
            "Content-Type": "application/json"
            },
        });

    res = await res.json();

    if ('success' in res) {
        const token = res.token;
        localStorage.setItem('TOKEN', token);
        location.href = '/dashboard';
    } else {
        const error_msg = document.getElementById("invalid-user-pass");
        error_msg.classList.remove("hidden");
    }

}
