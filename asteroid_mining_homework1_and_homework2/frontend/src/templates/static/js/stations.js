async function get_all_stations() {
    const button = document.getElementById("btn-get-all");
    button.textContent = "Clean Terminal";
    button.onclick = () => {
        button.onclick = get_all_stations;
        terminal.classList.add("hidden");
        button.textContent = "Activate";
    } 
    const terminal = document.getElementById("terminal-get-all");
    terminal.classList.remove("hidden");
    terminal.value = "Sending request to mainframe...";
    let res = await fetch('/api/v1/stations',
        {
            method: 'GET',
            headers: {Authorization: `Bearer ${localStorage.getItem('TOKEN')}`}
        }); 
    terminal.value += "Done\n";
    terminal.value += "Receiveing the response...";
    res = await res.json(); 
    terminal.value += "Done\n";

    if ('stations' in res) {
        const stations = res.stations;

        if (stations.length === 0) {
            terminal.value += "We don't have any stations 😱\n";
        } else {
            terminal.value += `We have a total of ${stations.length} stations\nWith the following ids:\n`
            stations.forEach((x) => {
                terminal.value += `id: ${x.id}, name: \`${x.station_name}\`, location: \`${x.location}\`\n`;
            });
        }
    } else {
        terminal.value += "The mainframe cannot get the stations\n";
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

async function add_station() {
    const terminal = document.getElementById("terminal-add");
    const station_name = document.getElementById("input-add-name").value;
    const location = document.getElementById("input-add-location").value;
    terminal.value = "Sending request to mainframe...";
    let res = await fetch('/api/v1/stations/new',
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('TOKEN')}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({station_name, location}),
        }); 
    terminal.value += "Done\n";
    terminal.value += "Receiveing the response...";
    res = await res.json(); 
    terminal.value += "Done\n";

    if ('id' in res ) {
        terminal.value += `Created new station with id ${res.id}\n`;
    } else {
        terminal.value += "Could add station to fleet 😭\n";
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

async function modify_station() {
    const terminal = document.getElementById("terminal-modify");
    const station_id = parseInt(document.getElementById("input-modify-station").value);
    const station_name = document.getElementById("input-modify-name").value;
    const location = document.getElementById("input-modify-location").value;

    terminal.value = "Sending request to mainframe...";
    let res = await fetch(`/api/v1/stations/${station_id}/change`,
        {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('TOKEN')}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({station_name, location}),
        }); 
    terminal.value += "Done\n";
    terminal.value += "Receiveing the response...";
    res = await res.json(); 
    terminal.value += "Done\n";
    if ('station' in res) {
        terminal.value += "Successfully updated station\n";
    }  else {
        terminal.value += "Could not update station\n";
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

async function destroy_station() {
    const terminal = document.getElementById("terminal-destroy");
    const station_id = parseInt(document.getElementById("input-destroy-station").value);

    terminal.value = "Sending request to mainframe...";
    let res = await fetch(`/api/v1/stations/${station_id}/destroy`,
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
        terminal.value += "Could not destroy station\n";
    } 
}
