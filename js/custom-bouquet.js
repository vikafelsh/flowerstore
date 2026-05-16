let customFlowers = [];
let wrappingOptions = [];
let selectedWrapping = null;
let bouquetItems = [];
let selectedFlowerElement = null;
let flowerCounter = 0;

document.addEventListener("DOMContentLoaded", () => {
    loadCustomBouquetData();

    const startBuilderBtn = document.getElementById("startBuilderBtn");

    if (startBuilderBtn) {
        startBuilderBtn.addEventListener("click", startBouquetBuilder);
    }
});

async function loadCustomBouquetData() {
    try {
        const flowersResponse = await fetch("data/flowers.json");
        customFlowers = await flowersResponse.json();

        const wrappingResponse = await fetch("data/wrapping.json");
        wrappingOptions = await wrappingResponse.json();

        renderWrappingOptions();
        renderCustomFlowers();
    } catch (error) {
        console.error("Помилка завантаження конструктора:", error);
    }
}

function renderWrappingOptions() {
    const container = document.getElementById("wrappingOptions");
    container.innerHTML = "";

    wrappingOptions.forEach(wrapping => {
        const card = document.createElement("div");
        card.className = "wrapping-card";

        card.innerHTML = `
            <div class="wrapping-card-header">
                <h4>${wrapping.name}</h4>
                <p>${wrapping.type}</p>
                <span>$${wrapping.price}</span>
            </div>

            <div class="wrapping-variations-grid">
                ${wrapping.variations.map(variation => `
                    <div class="wrapping-variation-item">
                        <div class="wrapping-variation-image">
                            <img 
                                src="${variation.builderImage || variation.image || wrapping.image}" 
                                alt="${wrapping.name}, ${variation.name}">
                        </div>

                        <button
                            class="wrapping-variation-btn"
                            data-wrapping-id="${wrapping.id}"
                            data-variation-id="${variation.id}">
                            ${variation.name}
                        </button>
                    </div>
                `).join("")}
            </div>
        `;

        container.appendChild(card);
    });

    document.querySelectorAll(".wrapping-variation-btn").forEach(button => {
        button.addEventListener("click", () => selectWrappingVariation(button));
    });
}

function selectWrappingVariation(button) {
    const wrapping = wrappingOptions.find(item => item.id === button.dataset.wrappingId);
    if (!wrapping) return;

    const variation = wrapping.variations.find(item => item.id === button.dataset.variationId);
    if (!variation) return;

    selectedWrapping = {
        id: wrapping.id,
        name: wrapping.name,
        type: wrapping.type,
        price: wrapping.price,
        variationId: variation.id,
        variationName: variation.name,
        image: variation.image || wrapping.image,
        builderImage: variation.builderImage || variation.image || wrapping.image
    };

    document.querySelectorAll(".wrapping-card").forEach(card => {
        card.classList.remove("selected");
    });

    document.querySelectorAll(".wrapping-variation-btn").forEach(btn => {
        btn.classList.remove("selected");
    });

    button.classList.add("selected");
    button.closest(".wrapping-card").classList.add("selected");

    document.getElementById("startBuilderBtn").disabled = false;
}

function startBouquetBuilder() {
    if (!selectedWrapping) return;

    document.getElementById("wrappingStep").classList.add("hidden");
    document.getElementById("builderStep").classList.remove("hidden");

    updateWrappingImage();
    updateBouquetSummary();
}

function updateWrappingImage() {
    const image = document.getElementById("selectedWrappingImage");
    if (!image || !selectedWrapping) return;

    image.src = selectedWrapping.builderImage;
    image.alt = `${selectedWrapping.name}, ${selectedWrapping.variationName}`;
    image.style.display = "block";
}

function renderCustomFlowers() {
    const flowersList = document.getElementById("customFlowersList");
    flowersList.innerHTML = "";

    customFlowers.forEach(flower => {
        const card = document.createElement("div");
        card.className = "custom-flower-card";

        card.innerHTML = `
            <img src="${flower.colors[0].image}" alt="${flower.name}">

            <div class="custom-flower-info">
                <h4>${flower.name}</h4>
                <p>${flower.type}</p>
                <span>$${flower.price} за 1 шт.</span>

                <div class="flower-colors">
                    ${flower.colors.map(color => `
                        <button
                            class="flower-color-btn"
                            data-flower-id="${flower.id}"
                            data-color-id="${color.id}">
                            ${color.name}
                        </button>
                    `).join("")}
                </div>
            </div>
        `;

        flowersList.appendChild(card);
    });

    document.querySelectorAll(".flower-color-btn").forEach(button => {
        button.addEventListener("click", () => {
            addFlowerWithColor(button.dataset.flowerId, button.dataset.colorId);
        });
    });
}

function addFlowerWithColor(flowerId, colorId) {
    const flower = customFlowers.find(item => item.id === flowerId);
    if (!flower) return;

    const color = flower.colors.find(item => item.id === colorId);
    if (!color) return;

    flowerCounter++;

    const flowerItem = {
        itemId: `flower-${flowerCounter}`,
        name: flower.name,
        colorName: color.name,
        price: flower.price,
        image: color.image,
        size: flower.defaultSize,
        rotation: 0,
        x: 50,
        y: 50
    };

    bouquetItems.push(flowerItem);
    createFlowerElement(flowerItem);
    updateBouquetSummary();
}

function createFlowerElement(flowerItem) {
    const img = document.createElement("img");

    img.src = flowerItem.image;
    img.alt = `${flowerItem.name}, ${flowerItem.colorName}`;
    img.className = "bouquet-flower";
    img.dataset.itemId = flowerItem.itemId;

    setFlowerStyle(img, flowerItem);

    img.addEventListener("click", event => {
        event.stopPropagation();
        selectFlowerElement(img);
    });

    makeDraggable(img);

    document.getElementById("flowersLayer").appendChild(img);
}

function setFlowerStyle(element, item) {
    element.style.width = `${item.size}px`;
    element.style.left = `${item.x}%`;
    element.style.top = `${item.y}%`;
    element.style.transform = `translate(-50%, -50%) rotate(${item.rotation}deg)`;
}

function selectFlowerElement(element) {
    selectedFlowerElement = element;

    document.querySelectorAll(".bouquet-flower").forEach(flower => {
        flower.classList.remove("active-flower");
    });

    element.classList.add("active-flower");
}

function makeDraggable(element) {
    let isDragging = false;

    element.addEventListener("pointerdown", event => {
        isDragging = true;
        selectFlowerElement(element);
        element.setPointerCapture(event.pointerId);
    });

    element.addEventListener("pointermove", event => {
        if (!isDragging) return;

        const layer = document.getElementById("flowersLayer");
        const rect = layer.getBoundingClientRect();

        const x = Math.max(5, Math.min(95, ((event.clientX - rect.left) / rect.width) * 100));
        const y = Math.max(5, Math.min(95, ((event.clientY - rect.top) / rect.height) * 100));

        const item = getBouquetItemByElement(element);
        if (!item) return;

        item.x = x;
        item.y = y;

        setFlowerStyle(element, item);
    });

    element.addEventListener("pointerup", () => {
        isDragging = false;
    });

    element.addEventListener("pointercancel", () => {
        isDragging = false;
    });
}

function getBouquetItemByElement(element) {
    return bouquetItems.find(item => item.itemId === element.dataset.itemId);
}

function rotateSelectedFlower(amount) {
    if (!selectedFlowerElement) return;

    const item = getBouquetItemByElement(selectedFlowerElement);
    if (!item) return;

    item.rotation += amount;
    setFlowerStyle(selectedFlowerElement, item);
}

function resizeSelectedFlower(amount) {
    if (!selectedFlowerElement) return;

    const item = getBouquetItemByElement(selectedFlowerElement);
    if (!item) return;

    item.size = Math.max(50, Math.min(170, item.size + amount));
    setFlowerStyle(selectedFlowerElement, item);
}

function deleteSelectedFlower() {
    if (!selectedFlowerElement) return;

    const itemId = selectedFlowerElement.dataset.itemId;

    bouquetItems = bouquetItems.filter(item => item.itemId !== itemId);
    selectedFlowerElement.remove();
    selectedFlowerElement = null;

    updateBouquetSummary();
}

function clearBouquet() {
    bouquetItems = [];
    selectedFlowerElement = null;
    document.getElementById("flowersLayer").innerHTML = "";
    updateBouquetSummary();
}

function groupFlowers() {
    const grouped = {};

    bouquetItems.forEach(item => {
        const key = `${item.name}-${item.colorName}`;

        if (!grouped[key]) {
            grouped[key] = {
                name: item.name,
                colorName: item.colorName,
                count: 0,
                price: item.price
            };
        }

        grouped[key].count++;
    });

    return Object.values(grouped);
}

function calculateTotal() {
    const flowersTotal = bouquetItems.reduce((sum, item) => sum + item.price, 0);
    const wrappingPrice = selectedWrapping ? selectedWrapping.price : 0;

    return flowersTotal + wrappingPrice;
}

function updateBouquetSummary() {
    const summary = document.getElementById("selectedFlowersSummary");
    const total = document.getElementById("bouquetTotal");

    if (!summary || !total) return;

    summary.innerHTML = "";

    if (selectedWrapping) {
        summary.innerHTML += `
            <p>
                <strong>Оформлення:</strong>
                ${selectedWrapping.name}, ${selectedWrapping.variationName} — $${selectedWrapping.price}
            </p>
        `;
    }

    if (bouquetItems.length === 0) {
        summary.innerHTML += `<p>Додайте квіти до букета.</p>`;
    }

    groupFlowers().forEach(item => {
        summary.innerHTML += `
            <p>${item.name}, ${item.colorName} x${item.count} — $${item.count * item.price}</p>
        `;
    });

    total.textContent = `$${calculateTotal()}`;
}

function finishBouquet() {
    showOnlySection("bouquetResultSection");
    renderResultSection();
}

function renderResultSection() {
    const resultPreview = document.getElementById("resultBouquetPreview");
    const resultWrappingText = document.getElementById("resultWrappingText");
    const resultFlowersList = document.getElementById("resultFlowersList");
    const resultTotalPrice = document.getElementById("resultTotalPrice");
    const saveMessage = document.getElementById("saveBouquetMessage");

    if (!resultPreview || !resultWrappingText || !resultFlowersList || !resultTotalPrice) return;

    if (saveMessage) {
        saveMessage.textContent = "";
    }

    resultPreview.innerHTML = "";

    const stage = document.getElementById("bouquetStage");

    if (stage) {
        const copy = stage.cloneNode(true);

        copy.removeAttribute("id");
        copy.classList.remove("bouquet-stage");
        copy.classList.add("result-stage-copy");

        copy.querySelectorAll(".active-flower").forEach(flower => {
            flower.classList.remove("active-flower");
        });

        resultPreview.appendChild(copy);
    }

    resultWrappingText.innerHTML = `
        <strong>Оформлення:</strong>
        ${selectedWrapping ? selectedWrapping.name : "Не вибрано"},
        ${selectedWrapping ? selectedWrapping.variationName : ""}
    `;

    resultFlowersList.innerHTML = "";

    if (bouquetItems.length === 0) {
        resultFlowersList.innerHTML = "<li>Квіти ще не додані.</li>";
    } else {
        groupFlowers().forEach(item => {
            const li = document.createElement("li");
            li.textContent = `${item.name}, ${item.colorName} — ${item.count} шт.`;
            resultFlowersList.appendChild(li);
        });
    }

    resultTotalPrice.innerHTML = `<strong>Загальна ціна:</strong> $${calculateTotal()}`;
}

function showOnlySection(sectionId) {
    document.querySelectorAll(".page-section").forEach(section => {
        section.classList.remove("active");
    });

    document.getElementById(sectionId).classList.add("active");
}

function backToWrapping() {
    showOnlySection("custom");
    document.getElementById("wrappingStep").classList.remove("hidden");
    document.getElementById("builderStep").classList.add("hidden");
}

function backToFlowers() {
    showOnlySection("custom");
    document.getElementById("wrappingStep").classList.add("hidden");
    document.getElementById("builderStep").classList.remove("hidden");
}

function backToArrangement() {
    backToFlowers();
}

function createRandomBouquet() {
    if (customFlowers.length === 0 || wrappingOptions.length === 0) return;

    clearBouquet();
    chooseRandomWrapping();
    updateWrappingImage();

    const flowersCount = Math.floor(Math.random() * 5) + 3;

    for (let i = 0; i < flowersCount; i++) {
        addRandomFlower();
    }

    document.getElementById("wrappingStep").classList.add("hidden");
    document.getElementById("builderStep").classList.remove("hidden");

    updateBouquetSummary();
    finishBouquet();
}

function chooseRandomWrapping() {
    const wrapping = wrappingOptions[Math.floor(Math.random() * wrappingOptions.length)];
    const variation = wrapping.variations[Math.floor(Math.random() * wrapping.variations.length)];

    selectedWrapping = {
        id: wrapping.id,
        name: wrapping.name,
        type: wrapping.type,
        price: wrapping.price,
        variationId: variation.id,
        variationName: variation.name,
        image: variation.image || wrapping.image,
        builderImage: variation.builderImage || variation.image || wrapping.image
    };
}

function addRandomFlower() {
    const flower = customFlowers[Math.floor(Math.random() * customFlowers.length)];
    const color = flower.colors[Math.floor(Math.random() * flower.colors.length)];

    flowerCounter++;

    const flowerItem = {
        itemId: `flower-${flowerCounter}`,
        name: flower.name,
        colorName: color.name,
        price: flower.price,
        image: color.image,
        size: Math.max(60, flower.defaultSize + Math.floor(Math.random() * 25) - 10),
        rotation: Math.floor(Math.random() * 50) - 25,
        x: Math.floor(Math.random() * 55) + 22,
        y: Math.floor(Math.random() * 35) + 18
    };

    bouquetItems.push(flowerItem);
    createFlowerElement(flowerItem);
}

function saveBouquetDesign() {
    const saveMessage = document.getElementById("saveBouquetMessage");

    const bouquetData = {
        wrapping: selectedWrapping ? selectedWrapping.name : "Не вибрано",
        variation: selectedWrapping ? selectedWrapping.variationName : "",
        flowers: bouquetItems,
        totalPrice: calculateTotal(),
        createdAt: new Date().toLocaleString()
    };

    localStorage.setItem("savedBouquet", JSON.stringify(bouquetData));

    if (saveMessage) {
        saveMessage.textContent = "Букет збережено! Ви можете повернутися до нього пізніше.";
    }
}
