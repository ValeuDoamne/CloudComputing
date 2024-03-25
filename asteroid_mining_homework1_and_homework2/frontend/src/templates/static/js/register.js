async function register() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    let res = await fetch("/api/v1/users/new", 
        {
            method: "POST", 
            body: JSON.stringify({username, password}),
            headers: {
            "Content-Type": "application/json"
            },
        });

    res = await res.json();

    if ('success' in res) {
        window.location.href = "/login";
    }
}
