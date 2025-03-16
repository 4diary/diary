document.addEventListener("DOMContentLoaded", () => {
    const weekView = document.getElementById("weekView");
    const monthView = document.getElementById("monthView");
    const currentWeekSpan = document.getElementById("currentWeek");
    const prevWeekBtn = document.getElementById("prevWeek");
    const nextWeekBtn = document.getElementById("nextWeek");
    const monthSelectMenu = document.getElementById("monthSelect");

    let currentDate = new Date();
    let isWeekView = true;

    // Месяцы для выпадающего списка
    const monthList = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];

    // Заполнение выпадающего списка месяцами
    monthList.forEach((month, index) => {
        const option = document.createElement("option");
        option.value = index;  // Индекс месяца для установки
        option.textContent = month;
        monthSelectMenu.appendChild(option);
    });

    // Обработчик для выбора месяца из выпадающего списка
    monthSelectMenu.addEventListener("change", () => {
        const selectedMonth = parseInt(monthSelectMenu.value);
        currentDate.setMonth(selectedMonth);  // Устанавливаем месяц
        currentDate.setDate(1);  // Устанавливаем дату на первое число месяца
        renderWeek();  // Отображаем первую неделю выбранного месяца
    });

    // Получение начала недели
    function getWeekStart(date) {
        const tempDate = new Date(date);
        const day = tempDate.getDay();
        const diff = tempDate.getDate() - day + (day === 0 ? -6 : 1);
        tempDate.setDate(diff);
        return tempDate;
    }

    // Получение конца недели
    function getWeekEnd(startDate) {
        let endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        return endDate;
    }

    function formatDate(date) {
        return date.toISOString().split("T")[0];
    }

    function formatWeekLabel(startDate, endDate) {
        const options = { day: 'numeric', month: 'long' };
        return `${startDate.toLocaleDateString("ru-RU", options)} - ${endDate.toLocaleDateString("ru-RU", options)}`;
    }

    function loadPins(dayKey) {
        let pins = JSON.parse(localStorage.getItem(dayKey)) || [];
        if (pins.length > 0 && typeof pins[0] === "string") {
            pins = pins.map(text => ({ text, color: "#ffffff" }));
            savePins(dayKey, pins);
        }
        return pins;
    }

    function savePins(dayKey, pins) {
        localStorage.setItem(dayKey, JSON.stringify(pins));
    }

    function editPin(dayKey, oldText, pinTextElement) {
        let newText = prompt("Редактировать заметку:", oldText);
        if (newText !== null && newText.trim() !== "") {
            let pins = loadPins(dayKey);
            let index = pins.findIndex(p => p.text === oldText);
            if (index !== -1) {
                pins[index].text = newText;
                savePins(dayKey, pins);
                pinTextElement.textContent = newText;
            }
        }
    }

function createPinElement(dayKey, pin) {
    let pinDiv = document.createElement("div");
    pinDiv.classList.add("pin");
    pinDiv.style.backgroundColor = pin.color || "#ffffff";

    // Создаем элемент для картинки (например, лапка)
    let checkBoxImage = document.createElement("img");
    checkBoxImage.src = pin.checked ? "lapka.png" : "white.jpg"; // Картинка для галочки
    checkBoxImage.alt = "Лапка"; // Подсказка для изображения
    checkBoxImage.classList.add("pin-image");
    checkBoxImage.style.cursor = "pointer";

    // Обработчик для изменения состояния чекбокса (картинки)
    checkBoxImage.addEventListener("click", () => {
        pin.checked = !pin.checked;
        checkBoxImage.src = pin.checked ? "lapka.png" : "white.jpg"; // Меняем картинку
        savePins(dayKey, loadPins(dayKey)); // Сохраняем состояние
    });

    let pinText = document.createElement("span");
    pinText.textContent = pin.text;
    pinText.addEventListener("click", () => editPin(dayKey, pin.text, pinText));

    let textContainer = document.createElement("div");
    textContainer.classList.add("text-container");
    textContainer.appendChild(checkBoxImage); // Добавляем картинку перед текстом
    textContainer.appendChild(pinText);

    let colorPicker = document.createElement("input");
    colorPicker.type = "color";
    colorPicker.classList.add("color-picker");
    colorPicker.value = pin.color || "#ffffff";
    colorPicker.addEventListener("input", (event) => {
        let newColor = event.target.value;
        pinDiv.style.backgroundColor = newColor;
        let pins = loadPins(dayKey);
        let index = pins.findIndex(p => p.text === pin.text);
        if (index !== -1) {
            pins[index].color = newColor;
            savePins(dayKey, pins);
        }
    });

    let deleteBtn = document.createElement("button");
    deleteBtn.textContent = "✖";
    deleteBtn.classList.add("delete-pin");
    deleteBtn.addEventListener("click", () => {
        let pins = loadPins(dayKey).filter(p => p.text !== pin.text);
        savePins(dayKey, pins);
        renderWeek();
    });

    let buttonContainer = document.createElement("div");
    buttonContainer.classList.add("button-container");
    buttonContainer.appendChild(colorPicker);
    buttonContainer.appendChild(deleteBtn);

    pinDiv.appendChild(textContainer);
    pinDiv.appendChild(buttonContainer);
    return pinDiv;
}

    

    function renderWeek() {
        weekView.innerHTML = "";
        let startOfWeek = getWeekStart(new Date(currentDate));
        let endOfWeek = getWeekEnd(startOfWeek);
        currentWeekSpan.textContent = formatWeekLabel(startOfWeek, endOfWeek);

        for (let i = 0; i < 7; i++) {
            let dayDate = new Date(startOfWeek);
            dayDate.setDate(startOfWeek.getDate() + i);
            let dayKey = formatDate(dayDate);

            let dayDiv = document.createElement("div");
            dayDiv.classList.add("day");
            dayDiv.innerHTML = `<strong>${dayDate.toLocaleDateString("ru-RU", { weekday: 'short', day: 'numeric' })}</strong>`;

            let pinsDiv = document.createElement("div");
            pinsDiv.classList.add("pins");

            let pins = loadPins(dayKey);
            pins.forEach(pin => {
                pinsDiv.appendChild(createPinElement(dayKey, pin));
            });

            let addPinBtn = document.createElement("button");
            addPinBtn.textContent = "мяукнуть";
            addPinBtn.classList.add("add-pin");
            addPinBtn.addEventListener("click", () => {
                let newPinText = prompt("Введите заметку:");
                if (newPinText) {
                    let pins = loadPins(dayKey);
                    pins.push({ text: newPinText, color: "#ffffff" });
                    savePins(dayKey, pins);
                    renderWeek();
                }
            });

            dayDiv.appendChild(pinsDiv);
            dayDiv.appendChild(addPinBtn);
            weekView.appendChild(dayDiv);
        }
    }

    prevWeekBtn.addEventListener("click", () => {
        currentDate.setDate(currentDate.getDate() - 7);
        renderWeek();
    });

    nextWeekBtn.addEventListener("click", () => {
        currentDate.setDate(currentDate.getDate() + 7);
        renderWeek();
    });

    renderWeek();
});
