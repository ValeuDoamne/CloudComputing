window.onload =  async () => {
    let res = await fetch('/api/v1/users/about',
        {
            method: "POST",
            headers: {Authorization: `Bearer ${localStorage.getItem("TOKEN")}`}
        });
    res = await res.json();
    if ('success' in res) {
        const greetings = document.getElementById("greetings");
        greetings.textContent = `Greetings ${res.username}`;
    }
};
