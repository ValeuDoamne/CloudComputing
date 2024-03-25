async function get_all_astronauts() {
    const button = document.getElementById("btn-get-all");
    button.textContent = "Clean Terminal";
    button.onclick = () => {
        button.onclick = get_all_astronauts;
        terminal.classList.add("hidden");
        button.textContent = "Activate";
    } 
    const terminal = document.getElementById("terminal-get-all");
    terminal.classList.remove("hidden");
    terminal.value = "Sending request to mainframe...";
    let res = await fetch('/api/v1/astronauts',
        {
            method: 'GET',
            headers: {Authorization: `Bearer ${localStorage.getItem('TOKEN')}`}
        }); 
    terminal.value += "Done\n";
    terminal.value += "Receiveing the response...";
    res = await res.json(); 
    terminal.value += "Done\n";

    if ('astronauts' in res) {
        const astronauts = res.astronauts;

        if (astronauts.length === 0) {
            terminal.value += "We don't have any astronauts 😱\n";
        } else {
            terminal.value += `We have a total of ${astronauts.length} astronauts\nWith the following ids:\n`
            astronauts.forEach((x) => {
                terminal.value += `id: ${x.id}, fist name: \`${x.first_name}\`, last name: \`${x.last_name}\`, station id: \`${x.station_id}\`, salary: \`${x.salary}\` birth: \`${x.birth}\`\n`;
            });
        }
    } else {
        terminal.value += "The mainframe cannot get the astronauts\n";
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

async function add_astronaut() {
    const terminal = document.getElementById("terminal-add");
    const first_name = document.getElementById("input-add-first-name").value;
    const last_name = document.getElementById("input-add-last-name").value;
    const station_id = parseInt(document.getElementById("input-add-station").value);
    const salary = parseInt(document.getElementById("input-add-salary").value);
    const birth= document.getElementById("input-add-birth").value;
    terminal.value = "Sending request to mainframe...";
    let res = await fetch('/api/v1/astronauts/new',
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('TOKEN')}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({first_name, last_name, station_id, salary, birth}),
        }); 
    terminal.value += "Done\n";
    terminal.value += "Receiveing the response...";
    res = await res.json(); 
    terminal.value += "Done\n";

    if ('id' in res ) {
        terminal.value += `Created new astronaut with id ${res.id}\n`;
    } else {
        terminal.value += "Could add astronaut to fleet 😭\n";
    }
    terminal.value += "Finished the communication...\n";
}

function show_auto_add_submenu() {
    const submenu = document.getElementById("submenu-auto-add");
    const button = document.getElementById("btn-auto-submenu");
    submenu.classList.remove("hidden");
    button.textContent = "Clean";
    button.onclick = () => {
        submenu.classList.add("hidden");
        button.onclick = show_auto_add_submenu;
        button.textContent = "Show SubMenu";
    } 
}

async function auto_add_astronaut() {
    const terminal = document.getElementById("terminal-auto-add");
    terminal.value = "Sending request to mainframe...";
    let res = await fetch('/api/v1/astronauts/auto_add',
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('TOKEN')}`,
                "Content-Type": "application/json",
            },
        }); 
    terminal.value += "Done\n";
    terminal.value += "Receiving the response...";
    res = await res.json(); 
    terminal.value += "Done\n";

    if ('success' in res ) {
        terminal.value += res.success+'\n';
    } else {
        terminal.value += "Could add astronaut to fleet 😭\n";
    }
    terminal.value += "Finished the communication...\n";
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

async function modify_astronaut() {
    const terminal = document.getElementById("terminal-modify");
    const astronaut_id = parseInt(document.getElementById("input-modify-id").value);
    const first_name = document.getElementById("input-modify-first-name").value;
    const last_name = document.getElementById("input-modify-last-name").value;
    const station_id = parseInt(document.getElementById("input-modify-station").value);
    const salary = parseInt(document.getElementById("input-modify-salary").value);
    const birth= document.getElementById("input-modify-birth").value;

    terminal.value = "Sending request to mainframe...";
    let res = await fetch(`/api/v1/astronauts/${astronaut_id}/update`,
        {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('TOKEN')}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({first_name, last_name, station_id, salary, birth}),
        }); 
    terminal.value += "Done\n";
    terminal.value += "Receiveing the response...";
    res = await res.json(); 
    terminal.value += "Done\n";
    if ('astronaut' in res) {
        terminal.value += "Successfully updated astronaut\n";
    }  else {
        terminal.value += "Could not update astronaut\n";
    }
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

async function destroy_astronaut() {
    const terminal = document.getElementById("terminal-destroy");
    const astronaut_id = parseInt(document.getElementById("input-destroy-astronaut").value);

    terminal.value = "Sending request to mainframe...";
    let res = await fetch(`/api/v1/astronauts/${astronaut_id}/remove`,
        {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('TOKEN')}`,
                "Content-Type": "application/json",
            },
        }); 
    terminal.value += "Done\n";
    terminal.value += "Receiveing the response...";
    res = await res.json(); 
    terminal.value += "Done\n";
    if ('success' in res) {
        terminal.value += res.success+"\n"; 
    }  else {
        terminal.value += "Could not destroy astronaut\n";
    } 
}
