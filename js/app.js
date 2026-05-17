/* Харченко */
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
    if (currentCategoryId === "search") {
        document.getElementById("categoryPageTitle").textContent = "Search Results";

        const container = document.getElementById("categoryProductsContainer");
        container.innerHTML = "";

        currentProducts.forEach(function (product) {
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
        return;
    }

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

    currentCategoryId = "search";
    currentCategoryName = "Search Results";
    currentProducts = foundProducts;

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
    document.getElementById("searchMessage").textContent = "";

    currentCategoryId = "";
    currentCategoryName = "";
    currentProducts = [];

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

function clearAccountData() {
    localStorage.removeItem("firstName");
    localStorage.removeItem("lastName");

    document.getElementById("firstNameInput").value = "";
    document.getElementById("lastNameInput").value = "";

    const savedAccountData = document.getElementById("savedAccountData");
    savedAccountData.innerHTML = `
        <p>No account information saved yet.</p>
    `;

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

// Змінні для візуального наповнення кошика
let caughtFlowers = []; 
const maxVisualFlowers = 20; 

// 1. ЗАВАНТАЖЕННЯ ЗОБРАЖЕНЬ
const bgImg = new Image();
bgImg.src = 'assets/background.jpg';

const basketImg = new Image();
basketImg.src = 'assets/basket.png';

const flowerFiles = [
    'flower1.1.png', 'flower1.2.png', 'flower1.3.png', 
    'flower2.1.png', 'flower2.2.png', 'flower2.3.png', 
    'flower3.1.png', 'flower3.2.png', 'flower3.3.png'
];
const flowerImages = flowerFiles.map(file => {
    const img = new Image();
    img.src = `assets/${file}`;
    return img;
});

// Елементи інтерфейсу
const canvas = document.getElementById('flowerGame');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('game-start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const finalScoreText = document.getElementById('final-score');
const discountInfoText = document.getElementById('discount-info');

canvas.width = 400;
canvas.height = 500;

let gameRunning = false;
let score = 0;
let flowers = [];
let animationId;
let framesSinceLastSpawn = 0;

let basket = {
    x: canvas.width / 2 - 60,
    y: canvas.height - 80,
    width: 120,
    height: 90,
    maxSpeed: 12,
    currentSpeed: 0,
    acceleration: 2.5,
    friction: 0.7
};

let keys = { ArrowLeft: false, ArrowRight: false, a: false, d: false };

document.addEventListener('keydown', (e) => { if (e.key in keys) keys[e.key] = true; });
document.addEventListener('keyup', (e) => { if (e.key in keys) keys[e.key] = false; });

function spawnFlower() {
    const maxFlowersOnScreen = (score < 10) ? 3 : 5;
    framesSinceLastSpawn++;

    if (flowers.length < maxFlowersOnScreen && framesSinceLastSpawn > 45) {
        let spawnChance = 0.02 + (score * 0.002);
        if (spawnChance > 0.07) spawnChance = 0.07;

        if (Math.random() < spawnChance) {
            let speedMin = 1.8 + (score * 0.15);
            let speedMax = 3.0 + (score * 0.2);
            if (speedMax > 8) speedMax = 8;
            if (speedMin > 5) speedMin = 5;

            const flowerImg = flowerImages[Math.floor(Math.random() * flowerImages.length)];
            const targetWidth = 55; 
            
            let targetHeight = targetWidth;
            if (flowerImg.naturalHeight > 0) {
                const aspectRatio = flowerImg.naturalWidth / flowerImg.naturalHeight;
                targetHeight = targetWidth / aspectRatio;
            }

            const margin = 30;

            flowers.push({
                x: margin + Math.random() * (canvas.width - targetWidth - margin * 2),
                y: -targetHeight - 10,
                width: targetWidth,
                height: targetHeight,
                speed: speedMin + Math.random() * (speedMax - speedMin),
                img: flowerImg
            });

            framesSinceLastSpawn = 0;
        }
    }
}

function update() {
    if (!gameRunning) return;

    if (keys.ArrowLeft || keys.a) {
        basket.currentSpeed -= basket.acceleration;
    } else if (keys.ArrowRight || keys.d) {
        basket.currentSpeed += basket.acceleration;
    } else {
        basket.currentSpeed *= basket.friction;
        if (Math.abs(basket.currentSpeed) < 0.1) basket.currentSpeed = 0;
    }

    if (basket.currentSpeed > basket.maxSpeed) basket.currentSpeed = basket.maxSpeed;
    if (basket.currentSpeed < -basket.maxSpeed) basket.currentSpeed = -basket.maxSpeed;

    basket.x += basket.currentSpeed;

    if (basket.x < 0) {
        basket.x = 0;
        basket.currentSpeed = 0;
    }
    if (basket.x > canvas.width - basket.width) {
        basket.x = canvas.width - basket.width;
        basket.currentSpeed = 0;
    }

    spawnFlower();

    for (let i = flowers.length - 1; i >= 0; i--) {
        let f = flowers[i];
        f.y += f.speed;

        const flowerCenterX = f.x + f.width / 2;
        const flowerBottomY = f.y + f.height;
        const basketActiveLeft = basket.x + 25; 
        const basketActiveRight = basket.x + basket.width - 25;
        const basketTop = basket.y + 30;

        if (flowerBottomY > basketTop && 
            flowerCenterX > basketActiveLeft && 
            flowerCenterX < basketActiveRight) {
            
            if (f.y < basket.y + basket.height) {
                
                // Додаємо квіточку в "візуальний" кошик
                if (caughtFlowers.length < maxVisualFlowers) {
                    caughtFlowers.push({
                        img: f.img,
                        // Рандомне зміщення всередині кошика
                        offsetX: Math.random() * (basket.width - 40) + 10,
                        offsetY: Math.random() * 20 + 5, 
                        w: f.width * 0.7, // Робимо трохи меншими
                        h: f.height * 0.7
                    });
                }

                flowers.splice(i, 1);
                score++;
            }
        } else if (f.y > canvas.height) {
            endGame();
        }
    }
}

function endGame() {
    gameRunning = false;
    cancelAnimationFrame(animationId);
    gameOverScreen.classList.remove('hidden');
    finalScoreText.textContent = `Спіймано квітів: ${score}`;
    
    let goal = 15;
    if (score >= goal) {
        discountInfoText.textContent = "Вітаємо! Ваша знижка 10%: BLOOM10";
    } else {
        discountInfoText.textContent = `До знижки не вистачило ${goal - score} шт.`;
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Фон
    if (bgImg.complete) {
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
    }

    // --- ЛОГІКА ОБ'ЄМНОГО НАПОВНЕННЯ ---

    // 2. ШАР 1: Квіти за задньою стінкою
    // Малюємо їх ПЕРЕД кошиком, щоб вони визирали з-за заднього борту
    caughtFlowers.forEach((cf, index) => {
        if (index % 2 === 0) { 
            ctx.drawImage(
                cf.img, 
                basket.x + cf.offsetX, 
                basket.y + cf.offsetY + 5, // Трохи вище за основну масу
                cf.w, 
                cf.h
            );
        }
    });

    // 3. ШАР 2: Сама корзинка (основна картинка)
    ctx.drawImage(basketImg, basket.x, basket.y, basket.width, basket.height);

    // 4. ШАР 3: Квіти всередині (перед задньою стінкою, але за передньою)
    ctx.save();
    ctx.beginPath();
    // Малюємо овал обрізки чітко по центру плетіння
    ctx.ellipse(
        basket.x + basket.width / 2, 
        basket.y + 45, 
        basket.width / 2 - 22, // Звузили, щоб не вилазило на боки
        12,                     // Зробили овал плоским
        0, 0, Math.PI * 2
    );
    ctx.clip();

    caughtFlowers.forEach((cf, index) => {
        if (index % 2 !== 0) { 
            ctx.drawImage(
                cf.img, 
                basket.x + cf.offsetX, 
                basket.y + cf.offsetY + 22, // Глибоко всередині
                cf.w, 
                cf.h
            );
        }
    });
    ctx.restore();

    // 5. Падаючі квіти
    flowers.forEach(f => {
        ctx.drawImage(f.img, f.x, f.y, f.width, f.height);
    });

    // 6. Рахунок
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.roundRect(10, 10, 140, 35, 10); 
    ctx.fill();
    ctx.fillStyle = '#5b3a46';
    ctx.font = 'bold 20px Poppins';
    ctx.fillText(`Рахунок: ${score}`, 25, 35);
}
function gameLoop() {
    if (!gameRunning) return;
    update();
    draw();
    animationId = requestAnimationFrame(gameLoop);
}

function startGame() {
    gameRunning = true;
    score = 0;
    flowers = [];
    caughtFlowers = []; // Очищуємо кошик
    framesSinceLastSpawn = 0;
    basket.x = canvas.width / 2 - basket.width / 2;
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    gameLoop();
}

if (startBtn) startBtn.onclick = startGame;
if (restartBtn) restartBtn.onclick = startGame;

const originalShowSection = showSection;
showSection = function(id) {
    if (typeof originalShowSection === 'function') originalShowSection(id);
    if (id === 'game') {
        gameRunning = false;
        startScreen.classList.remove('hidden');
        gameOverScreen.classList.add('hidden');
        draw(); 
    }
};

basketImg.onload = () => draw();
bgImg.onload = () => draw();
/* Закінчення вставки */
