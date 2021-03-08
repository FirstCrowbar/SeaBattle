//ОБЪЕКТ ПРЕДСТАВЛЕНИЯ
let view = {
    //ВЫВОД СООБЩЕНИЙ
    displayMessage: function (msg) {    //Аргумент функции будет отображён в левом верхнем углу экрана
        let messageArea = document.getElementById("messageArea");
        messageArea.innerHTML = msg;
    },

    //ВЫВОД ПОПАДАНИЯ
    displayHit: function (location) {   //Введённые пользователем коорд. передаются как аргумент
        let cell = document.getElementById(location);   //Аргумент - id элемента
        cell.setAttribute("class", "hit");  //Меняем CSS атрибут у этого элемента
    },

    //ВЫВОД ПРОМАХА
    displayMiss: function (location) {  //Введённые пользователем коорд. передаются как аргумент
        let cell = document.getElementById(location);   //Аргумент - id элемента
        cell.setAttribute("class", "miss"); //Меняем CSS атрибут у этого элемента
    }
};
// view.displayHit("01");
// view.displayHit("02");
// view.displayMiss("33");

//_________________________________________________________________________________________
//ОБЪЕКТ МОДЕЛИ
let model = {
    boardSize: 7,   //Размер сетки игрового поля
    numShips: 3,    //Количество кораблей в игре
    shipLength: 3,  //Длина каждого корабля (в клетках)
    shipsSunk: 0,   //Количество потопленных кораблей
    ships: [{locations: [0, 0, 0], hits: ["", "", ""] },    //Положение кораблей
        {locations: [0, 0, 0], hits: ["", "", ""] },
        {locations: [0, 0, 0], hits: ["", "", ""] }],
    fire: function (guess) {    //Метод получает координаты выстрела
        for (let i = 0; i < this.numShips; i++) {   //Перебирает массив ships
            let ship = this.ships[i];   //Получает объект текущего корабля
            let locations = ship.locations; //Получает локацию текущего корабля
            let index = locations.indexOf(guess);   //Ищет в массиве указанное значение и возвращает его индекс
                                                    //Если значение отсутствует, возвращает -1. Поэтому...
            //let index = ship.locations.indexOf(guess); - более краткий вариант двух строк выше
            if (index >= 0) {   //Если значение больше 0
                ship.hits[index] = "hit";   //Текущей палубе записывается попадание
                view.displayHit(guess); //Оповещение о том, что в клетке guess вывести маркер попадания
                view.displayMessage("Попадание");   //И выводим сообщение
                if (this.isSunk(ship)) {    //Если корабль потоплен (проверка функцией ниже)
                    view.displayMessage("Корабль потоплен!!");  //Корабль потоплен!
                    this.shipsSunk++;   //Количество потопленных кораблей +1
                    if (model.shipsSunk === model.numShips) {    //Проверка на конец игры
                        view.displayMessage("Вы потопили все корабли!");
                    }
                }
                return true;
            }
        }
        view.displayMiss(guess);
        view.displayMessage("Вы промахнулись"); //Оповещение о том, что в клетке guess вывести маркер промаха
        return  false;
    },
    isSunk: function(ship) {    //Метод проверяет, потоплен ли корабль
        for (let i = 0; i < this.shipLength; i++) {
            if (ship.hits[i] !== "hit") {   //В случае, если хотя бы одна палуба не поражена
                return false;   //Возвращает false
            }
        }
        return true;    //Иначе - корабль потоплен (true)
    },

    //Блок создания новых кораблей
    generateShipLocations: function () {
        let locations;
        for (let i = 0; i < this.numShips; i++) {   //Перебор кораблей по их кол-ву в numShips
            do {
                locations = this.generateShip();    //Генерируем набор позиций
            } while (this.collision(locations));    //Цикл проверки на колизию
            this.ships[i].locations = locations;    //Сохранение позиции в массиве
        }
    },

    //Блок генерации позиции кораблей
    generateShip: function () {
        let direction = Math.floor(Math.random() * 2);  //Генерация числа от 0 до 1
        let row, col;
        if (direction === 1) {  //Если direction = 1, создаётся горизонтальный корабль
            row = Math.floor(Math.random() * this.boardSize);   //Генерация первой ячейки гориз. корабля
            col = Math.floor(Math.random() * (this.boardSize - this.shipLength));   //Генерация остальных ячеек
        } else {    //Если direction = 0, создаётся вертикальный корабль
            row = Math.floor(Math.random() * (this.boardSize - this.shipLength));   //Генерация первой ячейки верт. корабля
            col = Math.floor(Math.random() * this.boardSize);   //Генерация остальных ячеек
        }
        let newShipLocations = [];  //Сюда будут добавляться элементы
        for (let i = 0; i < this.shipLength; i++) { //Цикл по длине корабля
            if (direction === 1) {
               newShipLocations.push(row + "" + (col + i)); //При каждой итерации позиция добавляется в массив гориз. корабля
            } else {
               newShipLocations.push((row + i) + "" + col); //При каждой итерации позиция добавляется в массив верт. корабля
            }
        }
        return newShipLocations;    //Метод возвращает массив
    },

    //Блок ограничений коллизии
    collision: function (locations) {
        for (let i = 0; i < this.numShips; i++) {   //Перебирает все корабли
            let ship = model.ships[i];
            for (let j = 0; j < locations.length; j++) {//Перебирает все позиции
                if (ship.locations.indexOf(locations[j]) >= 0) {
                    return true;
                }
            }
        }
        return  false;
    },
};
// model.fire("06");
// model.fire("26");
// model.fire("16");

//_________________________________________________________________________________________
//ОБЪЕКТ КОНТРОЛЛЕРА
let controller = {
    guesses: 0,

    //Блок обработки введённых данных
    processGuess: function (guess) {

        // let location = parseGuess(guess);
        // if (location) {
        //     this.guesses++;                 //Счётчик выстрелов
        //     let hit = model.fire(location);
        //     if (hit && model.shipsSunk === model.numShips) {    //Проверка на конец игры
        //         view.displayMessage("Вы потопили все корабли!");
        //     }
        // }

            const alphabet = ["a", "b", "c", "d", "e", "f", "g"];
            if (guess === null || guess.length !== 2) {     //Проверка на правильность ввода
                alert("Введите корректные координаты выстрела");
            } else {
                let firstChar = guess.charAt(0);        //Извлекаем первый символ строки
                let row = alphabet.indexOf(firstChar);  //Получаем цифру, соответствующую букве
                let column = guess.charAt(1);           //Получаем вторую цифру
                if (isNaN(row) || isNaN(column)) {
                    alert("Похоже, это не цифры");
                } else if (row < 0 || row >= model.boardSize || column < 0 || column >= model.boardSize) {
                    alert("Кажется, это за пределами доски"); //Проверка на соответствие размерам поля
                } else {
                    return row + column;    //Здесь то, что отправится модели в качестве цифровых координат выстрела
                }
            }

        return null;
    },

    //Блок сбора данных с формы
    handleFireButton: function () {
        let guessInput = document.getElementById("guessInput");
        let guess = guessInput.value;               //Данные формы содержатся в элементе value
        model.fire(controller.processGuess(guess)); //Цифровые координаты выстрела передаются модели
        guessInput.value = "";                      //Подчищаем введённый текст
    },

    //Блок триггеров
    init: function () {
        let fireButton = document.getElementById("fireButton");
        fireButton.onclick = this.handleFireButton; //При нажатии кнопки вызывается функция сбора данных формы
        let guessInput = document.getElementById("guessInput");
        guessInput.onkeypress = this.handleKeyPress;   //При нажатии ключевой клавиши вызывается функция
        model.generateShipLocations();  //До начала игры генерируем позиции кораблей
    },

    //Обработчик нажатия на клавишу enter
    handleKeyPress: function (e) {
        let fireButton = document.getElementById("fireButton");
        if (e.keyCode === 13) {     //Если использована клавиша под кодом 13 (см. таблицу)
            fireButton.click();     //Вызывается событие (по-моему, это уже jQuery)
            return false;           //Не оставляем ничго лишнего
        }
    },

};

controller.init();
console.log(model.ships);
// function handleFireButton() {
//     let guessInput = document.getElementById("guessInput");
//     let guess = guessInput.value;      //Данные формы содержатся в элементе value
//     model.fire(controller.processGuess(guess)); //Координаты выстрела передаются контроллеру
//     guessInput.value = "";              //Подчищаем введённый текст
//     return guess;
// }
// console.log(controller.handleFireButton());

// function init() {
//     let fireButton = document.getElementById("fireButton");
//     fireButton.onclick = handleFireButton();   //Обработчик события нажатия на кнопку fire
//     let guessInput = document.getElementById("guessInput");
//     guessInput.onkeypress = handleKeyPress;
//
// }
// init();

// function handleKeyPress(e) {
//     let fireButton = document.getElementById("fireButton");
//     if (e.keyCode === 13) {
//         fireButton.click();
//         return false;
//     }
// }
// window.onload = controller.init();
// model.fire(controller.processGuess("A3"));






