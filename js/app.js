/* Харченко */
let categories = [];
let products = [];
let currentProducts = [];
let currentCategoryId = "";
let currentCategoryName = "";
let selectedProduct = null;
let currentDiscount = 0;

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
    selectedProduct = product;
    currentDiscount = 0;

    const labels = {
        gift_bouquets: "Gift bouquet",
        wedding_flowers: "Wedding flower",
        seasonal_flowers: "Seasonal flower",
        indoor_plants: "Indoor plant",
        gifts: "Gift item"
    };

    document.getElementById("productLabel").textContent = labels[product.categoryId] || "Product";

    document.getElementById("detailsImage").src = product.image;
    document.getElementById("detailsName").textContent = product.name;
    document.getElementById("detailsDescription").textContent = product.fullDescription;

    document.getElementById("promoInput").value = "";
    document.getElementById("promoMessage").textContent = "";

    const quantityBox = document.getElementById("quantityBox");
    const quantityInput = document.getElementById("quantityInput");
    const quantityMessage = document.getElementById("quantityMessage");

    const flowerCategories = ["gift_bouquets", "wedding_flowers", "seasonal_flowers"];

    if (flowerCategories.includes(product.categoryId)) {
        quantityBox.style.display = "block";
        quantityInput.value = 1;
        quantityMessage.textContent = "";
        updateProductTotal();
    } else {
        quantityBox.style.display = "none";
        updateProductTotal();
    }

    showSection("productDetailsPage");
}

function updateProductTotal() {
    if (!selectedProduct) {
        return;
    }

    const quantityInput = document.getElementById("quantityInput");
    const quantityMessage = document.getElementById("quantityMessage");
    const detailsPrice = document.getElementById("detailsPrice");

    const flowerCategories = ["gift_bouquets", "wedding_flowers", "seasonal_flowers"];
    const isFlowerProduct = flowerCategories.includes(selectedProduct.categoryId);

    const productPrice = Number(selectedProduct.price.replace("$", ""));
    let quantity = 1;

    if (isFlowerProduct) {
        quantity = Number(quantityInput.value);

        if (quantity > 100) {
            quantityMessage.textContent = "For more than 100 flowers, please contact the shop to confirm availability.";
            detailsPrice.textContent = "Contact shop";
            return;
        }

        if (quantity < 1 || isNaN(quantity)) {
            quantityMessage.textContent = "Please enter a valid quantity.";
            detailsPrice.textContent = selectedProduct.price;
            return;
        }

        quantityMessage.textContent = "";
    }

    const totalBeforeDiscount = productPrice * quantity;
    const totalAfterDiscount = totalBeforeDiscount - (totalBeforeDiscount * currentDiscount);

    detailsPrice.textContent = `$${totalAfterDiscount.toFixed(2)}`;
}

function applyPromoCode() {
    if (!selectedProduct) {
        return;
    }

    const promoInput = document.getElementById("promoInput");
    const promoMessage = document.getElementById("promoMessage");

    const promoCode = promoInput.value.trim().toUpperCase();

    const discounts = {
        BLOOM10: 0.10,
        BLOOM15: 0.15,
        BLOOM20: 0.20
    };

    if (discounts[promoCode]) {
        currentDiscount = discounts[promoCode];
        updateProductTotal();

        promoMessage.textContent = `Promo code applied: ${promoCode}`;
        promoMessage.classList.remove("promo-error");
        promoMessage.classList.add("promo-success");
    } else {
        currentDiscount = 0;
        updateProductTotal();

        promoMessage.textContent = "Invalid promo code.";
        promoMessage.classList.remove("promo-success");
        promoMessage.classList.add("promo-error");
    }
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

    if (firstName.length > 20 || lastName.length > 20) {
    alert("First name and last name must be no longer than 20 characters.");
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

// 1. ЗАВАНТАЖЕННЯ ЗОБРАЖЕНЬ
const bgImg = new Image();
bgImg.src = 'assets/background.jpg';

const basketImg = new Image();
basketImg.src = 'assets/basket.png'; // Порожній кошик (0 - 14 квітів)

// --- НОВІ КАРТИНКИ ДЛЯ РІЗНИХ РІВНІВ ЗНИЖОК ---
const basketFull15Img = new Image();
basketFull15Img.src = 'assets/basketFull15.png'; // Наповнений кошик (15 - 29 квітів)

const basketFull30Img = new Image();
basketFull30Img.src = 'assets/basketFull30.png'; // Ще більше квітів (30 - 49 квітів)

const basketFull50Img = new Image();
basketFull50Img.src = 'assets/basketFull50.png'; // Максимально повний кошик (50+ квітів)
// ----------------------------------------------

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
    maxSpeed: 10,
    currentSpeed: 0,
    acceleration: 1.2,
    friction: 0.85
};

// --- КЕРУВАННЯ ---
let keys = { ArrowLeft: false, ArrowRight: false, a: false, d: false };

// Клавіатура
document.addEventListener('keydown', (e) => { if (e.key in keys) keys[e.key] = true; });
document.addEventListener('keyup', (e) => { if (e.key in keys) keys[e.key] = false; });

// Сенсор (для телефонів)
canvas.addEventListener('touchstart', handleTouch, { passive: false });
canvas.addEventListener('touchmove', handleTouch, { passive: false });
canvas.addEventListener('touchend', () => {
    if (gameRunning) basket.currentSpeed = 0;
}, { passive: false });

function handleTouch(e) {
    if (!gameRunning) return;
    e.preventDefault(); 

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    
    const scaleX = canvas.width / rect.width;
    const touchX = (touch.clientX - rect.left) * scaleX;

    basket.x = touchX - basket.width / 2;

    if (basket.x < 0) basket.x = 0;
    if (basket.x > canvas.width - basket.width) basket.x = canvas.width - basket.width;
}

function spawnFlower() {
    const maxFlowersOnScreen = (score < 10) ? 3 : 5;
    framesSinceLastSpawn++;

    if (flowers.length < maxFlowersOnScreen && framesSinceLastSpawn > 45) {
        let spawnChance = 0.02 + (score * 0.002);
        if (spawnChance > 0.07) spawnChance = 0.07;

        if (Math.random() < spawnChance) {
            const flowerImg = flowerImages[Math.floor(Math.random() * flowerImages.length)];
            const targetWidth = 55;
            let targetHeight = targetWidth;
            if (flowerImg.naturalHeight > 0) {
                targetHeight = targetWidth / (flowerImg.naturalWidth / flowerImg.naturalHeight);
            }

            flowers.push({
                x: 30 + Math.random() * (canvas.width - targetWidth - 60),
                y: -targetHeight - 10,
                width: targetWidth,
                height: targetHeight,
                speed: 1.8 + (score * 0.1) + Math.random() * 1.5,
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

    if (basket.x < 0) { basket.x = 0; basket.currentSpeed = 0; }
    if (basket.x > canvas.width - basket.width) { canvas.width - basket.width; basket.currentSpeed = 0; }

    spawnFlower();

    for (let i = flowers.length - 1; i >= 0; i--) {
        let f = flowers[i];
        f.y += f.speed;

        const flowerCenterX = f.x + f.width / 2;
        const flowerBottomY = f.y + f.height;
        const basketActiveLeft = basket.x + 25; 
        const basketActiveRight = basket.x + basket.width - 25;
        const basketTop = basket.y + 30;

        if (flowerBottomY > basketTop && flowerCenterX > basketActiveLeft && flowerCenterX < basketActiveRight) {
            if (f.y < basket.y + basket.height) {
                flowers.splice(i, 1);
                score++;
            }
        } else if (f.y > canvas.height) {
            endGame();
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (bgImg.complete) ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

    // --- ОНОВЛЕНА ЛОГІКА ЕВОЛЮЦІЇ КОРЗИНИ ---
    if (score >= 50 && basketFull50Img.complete) {
        // 50+ квітів — Максимальний рівень
        ctx.drawImage(basketFull50Img, basket.x, basket.y, basket.width, basket.height);
    } else if (score >= 30 && basketFull30Img.complete) {
        // 30-49 квітів — Середній рівень
        ctx.drawImage(basketFull30Img, basket.x, basket.y, basket.width, basket.height);
    } else if (score >= 15 && basketFull15Img.complete) {
        // 15-29 квітів — Перший рівень
        ctx.drawImage(basketFull15Img, basket.x, basket.y, basket.width, basket.height);
    } else {
        // Порожній кошик за замовчуванням
        ctx.drawImage(basketImg, basket.x, basket.y, basket.width, basket.height);
    }
    // ----------------------------------------

    flowers.forEach(f => {
        ctx.drawImage(f.img, f.x, f.y, f.width, f.height);
    });

    // Score plate
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.roundRect(10, 10, 140, 35, 10); 
    ctx.fill();
    
    ctx.fillStyle = '#5b3a46';
    ctx.font = 'bold 20px Poppins';
    ctx.fillText(`Score: ${score}`, 25, 35);
}

function endGame() {
    gameRunning = false;
    cancelAnimationFrame(animationId);
    gameOverScreen.classList.remove('hidden');
    
    finalScoreText.textContent = `Flowers caught: ${score}`;
    
    const goal10 = 15;
    const goal15 = 30;
    const goal20 = 50;

    if (score >= goal20) {
        discountInfoText.innerHTML = "LEGENDARY! You've unlocked 20% OFF:<br><strong>BLOOM20</strong>";
    } else if (score >= goal15) {
        discountInfoText.innerHTML = "AMAZING! You've unlocked 15% OFF:<br><strong>BLOOM15</strong>";
    } else if (score >= goal10) {
        discountInfoText.innerHTML = "GREAT! You've unlocked 10% OFF:<br><strong>BLOOM10</strong>";
    } else {
        discountInfoText.textContent = `Catch at least ${goal10} flowers to get a discount. You were so close!`;
    }
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
    framesSinceLastSpawn = 0;
    basket.x = canvas.width / 2 - basket.width / 2;
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    gameLoop();
}

if (startBtn) startBtn.onclick = startGame;
if (restartBtn) restartBtn.onclick = startGame;

basketImg.onload = () => draw();
bgImg.onload = () => draw();
/* Закінчення вставки */
