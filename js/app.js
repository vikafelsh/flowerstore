let categories = [];
let products = [];
let currentProducts = [];
let currentCategoryId = "";
let currentCategoryName = "";

const hamburgerBtn = document.getElementById("hamburgerBtn");
const navMenu = document.getElementById("navMenu");

hamburgerBtn.addEventListener("click", function () {
    navMenu.classList.toggle("show");
});

document.addEventListener("DOMContentLoaded", function () {
    loadData();
    updateAccountNavbar();
});

function showSection(sectionId) {
    const sections = document.querySelectorAll(".page-section");

    sections.forEach(function (section) {
        section.classList.remove("active");
    });

    document.getElementById(sectionId).classList.add("active");

    if (sectionId === "catalog" && products.length > 0) {
        renderCategories();
    }

    navMenu.classList.remove("show");
}

function loadData() {
    Promise.all([
        fetch("data/categories.json").then(function (response) {
            return response.json();
        }),
        fetch("data/products.json").then(function (response) {
            return response.json();
        })
    ])
    .then(function (data) {
        categories = data[0];
        products = data[1];

        renderCategories();
    })
    .catch(function (error) {
        console.log("Error loading JSON:", error);
    });
}

function renderCategories() {
    const container = document.getElementById("categoriesContainer");
    container.innerHTML = "";

    categories.forEach(function (category) {
        const card = document.createElement("div");
        card.className = "category-card";

        card.innerHTML = `
            <img src="${category.image}" alt="${category.name}">
            <h3>${category.name}</h3>
        `;

        card.addEventListener("click", function () {
            renderProductsByCategory(category.id, category.name);
        });

        container.appendChild(card);
    });
}

function renderProductsByCategory(categoryId, categoryName) {
    currentCategoryId = categoryId;
    currentCategoryName = categoryName;

    currentProducts = products.filter(function (product) {
        return product.categoryId === categoryId;
    });

    document.getElementById("categoryPageTitle").textContent = categoryName;

    const container = document.getElementById("categoryProductsContainer");
    container.innerHTML = "";

    currentProducts.forEach(function (product) {
        const card = document.createElement("div");
        card.className = "product-card";

        card.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
                <div class="short-info">
                    <p>${product.shortDescription}</p>
                </div>
            </div>

            <div class="product-info">
                <h3>${product.name}</h3>
                <p>${product.shortDescription}</p>
                <div class="price">${product.price}</div>
            </div>
        `;

        card.addEventListener("click", function () {
            openProductDetails(product);
        });

        container.appendChild(card);
    });

    showSection("productsPage");
}

function openProductDetails(product) {
    document.getElementById("detailsImage").src = product.image;
    document.getElementById("detailsName").textContent = product.name;
    document.getElementById("detailsDescription").textContent = product.fullDescription;
    document.getElementById("detailsPrice").textContent = product.price;

    showSection("productDetailsPage");
}

function backToCurrentCategory() {
    renderProductsByCategory(currentCategoryId, currentCategoryName);
}

function buyProduct() {
    alert("Thank you! This product was added to your order.");
}

function searchProducts() {
    const searchValue = document.getElementById("searchInput").value.toLowerCase().trim();
    const searchMessage = document.getElementById("searchMessage");

    if (searchValue === "") {
        searchMessage.textContent = "Please enter a product name.";
        return;
    }

    const foundProducts = products.filter(function (product) {
        return product.name.toLowerCase().includes(searchValue) ||
               product.shortDescription.toLowerCase().includes(searchValue) ||
               product.fullDescription.toLowerCase().includes(searchValue);
    });

    if (foundProducts.length === 0) {
        searchMessage.textContent = "Sorry, this product was not found.";
        return;
    }

    searchMessage.textContent = "";

    document.getElementById("categoryPageTitle").textContent = "Search Results";

    const container = document.getElementById("categoryProductsContainer");
    container.innerHTML = "";

    foundProducts.forEach(function (product) {
        const card = document.createElement("div");
        card.className = "product-card highlight";

        card.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
                <div class="short-info">
                    <p>${product.shortDescription}</p>
                </div>
            </div>

            <div class="product-info">
                <h3>${product.name}</h3>
                <p>${product.shortDescription}</p>
                <div class="price">${product.price}</div>
            </div>
        `;

        card.addEventListener("click", function () {
            openProductDetails(product);
        });

        container.appendChild(card);
    });

    showSection("productsPage");
}

function clearSearch() {
    document.getElementById("searchInput").value = "";
    showSection("catalog");
}

function showAccountPanel() {
    showSection("accountPage");

    const firstName = localStorage.getItem("firstName");
    const lastName = localStorage.getItem("lastName");

    if (firstName) {
        document.getElementById("firstNameInput").value = firstName;
    }

    if (lastName) {
        document.getElementById("lastNameInput").value = lastName;
    }

    renderSavedAccount();
}

function saveAccount() {
    const firstName = document.getElementById("firstNameInput").value.trim();
    const lastName = document.getElementById("lastNameInput").value.trim();

    if (firstName === "" || lastName === "") {
        alert("Please enter your first name and last name.");
        return;
    }

    localStorage.setItem("firstName", firstName);
    localStorage.setItem("lastName", lastName);

    renderSavedAccount();
    updateAccountNavbar();
}

function renderSavedAccount() {
    const firstName = localStorage.getItem("firstName");
    const lastName = localStorage.getItem("lastName");

    const savedAccountData = document.getElementById("savedAccountData");

    if (firstName && lastName) {
        savedAccountData.innerHTML = `
            <h3>Saved account information</h3>
            <p><strong>First name:</strong> ${firstName}</p>
            <p><strong>Last name:</strong> ${lastName}</p>
        `;
    } else {
        savedAccountData.innerHTML = `
            <p>No account information saved yet.</p>
        `;
    }
}

function updateAccountNavbar() {
    const firstName = localStorage.getItem("firstName");
    const lastName = localStorage.getItem("lastName");
    const accountInfo = document.getElementById("accountInfo");
    const userGreeting = document.getElementById("userGreeting");

    if (firstName && lastName) {
        accountInfo.textContent = `${firstName} ${lastName}`;
        userGreeting.textContent = `Welcome, ${firstName} ${lastName}! We hope you find your perfect bouquet.`;
    } else {
        accountInfo.textContent = "";
        userGreeting.textContent = "Welcome to Bloomora Flowers!";
    }
}

/* Вставка Варі */
// --- Логіка Flower Game ---

const canvas = document.getElementById('flowerGame');
const ctx = canvas.getContext('2d');
const gameOverScreen = document.getElementById('game-over-screen');
const restartBtn = document.getElementById('restart-btn');

// Налаштування розмірів (відповідно до CSS)
canvas.width = 400;
canvas.height = 500;

let basket = {
    x: canvas.width / 2 - 40,
    y: canvas.height - 60,
    width: 80,
    height: 40,
    speed: 7,
    dx: 0
};

// Стан клавіш
let keys = {
    ArrowLeft: false,
    ArrowRight: false,
    a: false,
    d: false
};

// Слухаємо натискання клавіш
document.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.key)) keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.key)) keys[e.key] = false;
});

function drawBasket() {
    ctx.fillStyle = '#c96f8f'; // Твій фірмовий колір
    // Малюємо кошик з округленими кутами
    ctx.beginPath();
    ctx.roundRect(basket.x, basket.y, basket.width, basket.height, 10);
    ctx.fill();
}

function update() {
    // Рух вліво (A або Стрілка вліво)
    if (keys.ArrowLeft || keys.a) {
        basket.dx = -basket.speed;
    } 
    // Рух вправо (D або Стрілка вправо)
    else if (keys.ArrowRight || keys.d) {
        basket.dx = basket.speed;
    } else {
        basket.dx = 0;
    }

    basket.x += basket.dx;

    // Обмеження, щоб кошик не виходив за краї
    if (basket.x < 0) basket.x = 0;
    if (basket.x + basket.width > canvas.width) basket.x = canvas.width - basket.width;
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawBasket();
    update();

    requestAnimationFrame(gameLoop);
}

// Запускаємо цикл гри
gameLoop();

// Тимчасово ховаємо екран програшу, щоб бачити гру
function startGame() {
    gameOverScreen.classList.add('hidden');
    // Тут потім обнулимо рахунок
}

restartBtn.addEventListener('click', startGame);
/* Закінчення вставки */
