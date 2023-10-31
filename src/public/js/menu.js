// Menu inicial
const menuItems = [];

// Agregar elementos comunes para todos los roles
menuItems.push({ text: "Login", link: "/login" });

// Obtener el role del usuario 
let user = document.getElementById('userRole').textContent;

// Crear lista de menu
function createMenu() {
    const ul = document.createElement("ul");
    ul.classList.add("navbar-nav", "me-auto", "mb-2", "mb-lg-0");

    menuItems.forEach((item) => {
        const li = document.createElement("li");
        li.classList.add("nav-item");

        const a = document.createElement("a");
        a.classList.add("nav-link");
        a.href = item.link;
        a.textContent = item.text;

        li.appendChild(a);
        ul.appendChild(li);
    });

    // Agregar la lista al elemento con id "navbarSupportedContent"
    const container = document.getElementById("navbarSupportedContent");
    container.appendChild(ul);
}


// Eliminar el elemento "Login" si hay alguien logueado
if (user) {
    // Encontrar la posición del elemento
    const indexToRemove = menuItems.findIndex((item) => item.text === "Login" && item.link === "/login");
    // Verificar si el elemento existe antes de eliminarlo
    if (indexToRemove !== -1) {
        // Eliminar el elemento
        menuItems.splice(indexToRemove, 1);
    }
}

// Menu para el "admin"
if (user === "admin") {
    menuItems.push({ text: "Logout", link: "/logout" });
    menuItems.push({ text: "Profile", link: "/profile" });
    menuItems.push({ text: "Products", link: "/products" });
    menuItems.push({ text: "Add Product", link: "/products/add_product" });
    menuItems.push({ text: "Current", link: "/current" });
}

// Menu para el "user"
if (user === "user") {
    menuItems.push({ text: "Logout", link: "/logout" });
    menuItems.push({ text: "Profile", link: "/profile" });
    menuItems.push({ text: "Products", link: "/products" });
    menuItems.push({ text: "Current", link: "/current" });
    menuItems.push({ text: "Chat", link: "/chat" });
}

createMenu();
