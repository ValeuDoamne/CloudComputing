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

function show_modify_submenu() {
    const submenu = document.getElementById("submenu-modify");
    const button = document.getElementById("btn-submenu-modify");
    submenu.classList.remove("hidden");
    button.textContent = "Clean";
    button.onclick = () => {
        submenu.classList.add("hidden");
        button.onclick = show_modify_submenu;
        button.textContent = "Show SubMenu";
    } 
}

function show_destory_submenu() {
    const submenu = document.getElementById("submenu-destroy");
    const button = document.getElementById("btn-submenu-destory");
    submenu.classList.remove("hidden");
    button.textContent = "Clean";
    button.onclick = () => {
        submenu.classList.add("hidden");
        button.onclick = show_destory_submenu;
        button.textContent = "Show SubMenu";
    }
}
