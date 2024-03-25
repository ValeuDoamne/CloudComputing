async function get_all_spaceprobes() {
    const button = document.getElementById("btn-get-all");
    button.textContent = "Clean Terminal";
    button.onclick = () => {
        button.onclick = get_all_spaceprobes;
        terminal.classList.add("hidden");
        button.textContent = "Activate";
    } 
    const terminal = document.getElementById("terminal-get-all");
    terminal.classList.remove("hidden");
    terminal.value = "Sending request to mainframe...";
    let res = await fetch('/api/v1/spaceprobes',
        {
            method: 'GET',
            headers: {Authorization: `Bearer ${localStorage.getItem('TOKEN')}`}
        }); 
    terminal.value += "Done\n";
    terminal.value += "Receiveing the response...";
    res = await res.json(); 
    terminal.value += "Done\n";

    if ('spaceprobes' in res) {
        const spaceprobes = res.spaceprobes;

        if (spaceprobes.length === 0) {
            terminal.value += "We don't have any spaceprobes 😱\n";
        } else {
            terminal.value += `We have a total of ${spaceprobes.length} spaceprobes\nWith the following ids:\n`
            spaceprobes.forEach((x) => {
                terminal.value += `id: ${x.id}, name: \`${x.name}\`, fabrication year: \`${x.fabrication_year}\`\n`;
            });
        }
    } else {
        terminal.value += "The mainframe cannot get the spaceprobes\n";
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

async function add_spaceprobe() {
    const terminal = document.getElementById("terminal-add");
    const name = document.getElementById("input-add-name").value;
    const fabrication_year = parseInt(document.getElementById("input-add-fabrication").value);
    terminal.value = "Sending request to mainframe...";
    let res = await fetch('/api/v1/spaceprobes/new',
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('TOKEN')}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({name, fabrication_year}),
        }); 
    terminal.value += "Done\n";
    terminal.value += "Receiveing the response...";
    res = await res.json(); 
    terminal.value += "Done\n";

    if ('id' in res ) {
        terminal.value += `Created new spaceprobe with id ${res.id}\n`;
    } else {
        terminal.value += "Could add spaceprobe to fleet 😭";
    }
    terminal.value += "Finished the communication...\n";

}

function show_add_op_submenu() {
    const submenu = document.getElementById("submenu-add-op");
    const button = document.getElementById("btn-submenu-add-op");
    submenu.classList.remove("hidden");
    button.textContent = "Clean";
    button.onclick = () => {
        submenu.classList.add("hidden");
        button.onclick = show_add_op_submenu;
        button.textContent = "Show SubMenu";
    } 
}

// <div class="hidden" id="submenu-add-op">
//     <span><h4>Astronaut ID</h4><input placeholder="Name..." type="number" id="input-add-op-astronaut" /></span>
//     <span><h4>Spaceprobe ID</h4><input placeholder="Name..." type="number" id="input-add-op-spaceprobe" /></span>
//     <span><h4>Add operator</h4><button onclick="add_operator()" id="btn-add-op">Add operator</button></span>
//     <textarea readonly="true" class="terminal" id="terminal-add-op"></textarea>
// </div>
async function add_operator() {
    const terminal = document.getElementById("terminal-add-op");
    const astronaut_id = parseInt(document.getElementById("input-add-op-astronaut").value);
    const spaceprobe_id = parseInt(document.getElementById("input-add-op-spaceprobe").value);

    const res = await fetch(`/api/v1/spaceprobes/${spaceprobe_id}/operator`,
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('TOKEN')}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({astronaut_id}),
        }); 
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

async function modify_spaceprobe() {
    const terminal = document.getElementById("terminal-modify");
    const spaceprobe_id = parseInt(document.getElementById("input-modify-spaceprobe").value);
    const name = document.getElementById("input-modify-name").value;
    const fabrication_year = parseInt(document.getElementById("input-modify-fabrication").value);

    terminal.value = "Sending request to mainframe...";
    let res = await fetch(`/api/v1/spaceprobes/${spaceprobe_id}/change`,
        {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('TOKEN')}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({name, fabrication_year}),
        }); 
    terminal.value += "Done\n";
    terminal.value += "Receiveing the response...";
    res = await res.json(); 
    terminal.value += "Done\n";
    if ('spaceprobe' in res) {
        terminal.value += "Successfully updated spaceprobe\n";
    }  else {
        terminal.value += "Could not update spaceprobe\n";
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

async function destroy_spaceprobe() {
    const terminal = document.getElementById("terminal-destroy");
    const spaceprobe_id = parseInt(document.getElementById("input-destroy-spaceprobe").value);

    terminal.value = "Sending request to mainframe...";
    let res = await fetch(`/api/v1/spaceprobes/${spaceprobe_id}/destroy`,
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
        terminal.value += "Successfully nuked spaceprobe\n";
    }  else {
        terminal.value += "Could not destroy spaceprobe\n";
    } 
}
