async function get_all_asteroids() {
    const button = document.getElementById("btn-get-all");
    button.textContent = "Clean Terminal";
    button.onclick = () => {
        button.onclick = get_all_asteroids;
        terminal.classList.add("hidden");
        button.textContent = "Activate";
    } 
    const terminal = document.getElementById("terminal-get-all");
    terminal.classList.remove("hidden");
    terminal.value = "Sending request to mainframe...";
    let res = await fetch('/api/v1/asteroids',
        {
            method: 'GET',
            headers: {Authorization: `Bearer ${localStorage.getItem('TOKEN')}`}
        }); 
    terminal.value += "Done\n";
    terminal.value += "Receiveing the response...";
    res = await res.json(); 
    terminal.value += "Done\n";

    if ('asteroids' in res) {
        const asteroids = res.asteroids;

        if (asteroids.length === 0) {
            terminal.value += "We don't have any asteroids 😱\n";
        } else {
            terminal.value += `We have a total of ${asteroids.length} asteroids\nWith the following ids:\n`
            asteroids.forEach((x) => {
                terminal.value += `id: ${x.id}, name: \`${x.name}\`\n`;
            });
        }
    } else {
        terminal.value += "The mainframe cannot get the asteroids\n";
    }
    terminal.value += "Finished the communication...\n";
}

function show_add_submenu() {
    const submenu = document.getElementById("submenu-add");
    const button = document.getElementById("btn-submenu");
    submenu.classList.remove("hidden");
    button.textContent = "Clean";
    button.onclick = () => {
        submenu.classList.add("hidden");
        button.onclick = show_add_submenu;
        button.textContent = "Show SubMenu";
    } 
}

function show_auto_add_submenu() {
    const submenu = document.getElementById("submenu-auto-add");
    const button = document.getElementById("btn-submenu-auto");
    submenu.classList.remove("hidden");
    button.textContent = "Clean";
    button.onclick = () => {
        submenu.classList.add("hidden");
        button.onclick = show_auto_add_submenu;
        button.textContent = "Show SubMenu";
    } 
}

async function auto_add_asteroid() {
    const terminal = document.getElementById("terminal-auto-add");
    terminal.value = "Sending request to mainframe...";
    const number_of_asteroids = parseInt(document.getElementById("input-auto-add-number").value);
    let res = await fetch('/api/v1/asteroids/explore',
        {
            method: 'POST',
            headers: {Authorization: `Bearer ${localStorage.getItem('TOKEN')}`},
            body: JSON.stringify({number_of_asteroids})
        }); 
    terminal.value += "Done\n";
    terminal.value += "Receiveing the response...";
    res = await res.json(); 
    terminal.value += "Done\n";

    if ('success' in res) {
        terminal.value += res.success+"\n";
    } else {
        terminal.value += "The mainframe cannot get the asteroids\n";
    }
    terminal.value += "Finished the communication...\n";
}

function show_modify_submenu() {
    const submenu = document.getElementById("submenu-modify");
    const button = document.getElementById("btn-submenu-modify");
    submenu.classList.remove("hidden"); button.textContent = "Clean";
    button.onclick = () => {
        submenu.classList.add("hidden");
        button.onclick = show_modify_submenu;
        button.textContent = "Show SubMenu";
    } 
}

async function modify_asteroid() {
    const asteroid_id = parseInt(document.getElementById('input-modify-asteroid').value);
    const name = document.getElementById('input-modify-name').value;
    const terminal = document.getElementById("terminal-modify");
    terminal.value = "Creating request...";
    let res = await fetch(`/api/v1/asteroids/${asteroid_id}/rename`,
        {
            method: 'PUT',
            headers: {Authorization: `Bearer ${localStorage.getItem('TOKEN')}`},
            body: JSON.stringify({name})
        }); 
    terminal.value += "Done\n";
    terminal.value += "Receiveing the response...";
    res = await res.json(); 
    terminal.value += "Done\n";

    if ('asteroid' in res) {
        terminal.value += "Successfully changed to name "+res.asteroid.name+"\n";
    } else {
        terminal.value += "The mainframe cannot get the asteroids\n";
    }
    terminal.value += "Finished the communication...\n";
}

function show_destroy_submenu() {
    const submenu = document.getElementById("submenu-destroy");
    const button = document.getElementById("btn-submenu-destroy");
    submenu.classList.remove("hidden");
    button.textContent = "Clean";
    button.onclick = () => {
        submenu.classList.add("hidden");
        button.onclick = show_destroy_submenu;
        button.textContent = "Show SubMenu";
    }
}

async function destroy_asteroid() {
    const asteroid_id = parseInt(document.getElementById('input-destroy-asteroid').value);
    const terminal = document.getElementById("terminal-destroy");
    terminal.value = "Creating request...";
    let res = await fetch(`/api/v1/asteroids/${asteroid_id}/destroy`,
        {
            method: 'DELETE',
            headers: {Authorization: `Bearer ${localStorage.getItem('TOKEN')}`},
        }); 
    terminal.value += "Done\n";
    terminal.value += "Receiveing the response...";
    res = await res.json(); 
    terminal.value += "Done\n";

    if ('success' in res) {
        terminal.value += res.success+'\n';
    } else {
        terminal.value += "The mainframe cannot get the asteroids\n";
    }
    terminal.value += "Finished the communication...\n";
}
