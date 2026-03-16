//-------------
//ИНИЦИАЛИЗАЦИЯ
//-------------
const readline = require('readline');
const helper = require('./utils/helper');
const ConsoleDecorator = require('./utils/decorator');
const fileManager = require('./utils/fileManager');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const PROJ_NAME = 'NOTE-BOOK';

let notes = fileManager.loadData();

const welcomeApp = () => {
    ConsoleDecorator.drawLine(50,3);
    console.log(`Приветствуем в приложении ${PROJ_NAME}`);
    showMenu();
}

const addNote = () => {
    rl.question("Введите название заметки",(title) => {
        rl.question("Ведите содержимое заметки",(content) => {
            const newNote = {
                id: notes.length + 1,
                title: title,
                content: content,
                date: helper.formatDate()
            }

            notes.push(newNote);
            fileManager.saveData(notes);
            console.log(`Всего заметок ${notes.length}`)
            showMenu();
        });
    });
};

const showNotes = () => {
     if(notes.length === 0){
        console.log("Пока в приложении не заметок!");
     }
        ConsoleDecorator.showAllFormatNotes(notes);
        showMenu();
     };

const showMenu = () => {
    console.log("1: Добавить заметку");
    console.log("2: Посмотреть заметки");
    console.log("3: Удалить заметку");

    rl.question('Выберите действие от 1 - 3 или 0 для выхода: ', (choice) => {
        switch(choice){
            case '1':
                addNote();
                break;
            case '2':
                showNotes();
                break;
            case '3':
                deleteNote();
                break;
            case '0':
                rl.question('Вы действительно хотите выйти? (да/нет): ', (answer) => {
                    if (answer === 'да' | answer === 'д' | answer === 'yes' | answer === 'y') {
                        console.log("bye bye! ");
                        rl.close();
                    } else {
                        console.log("Продолжаем работу...");
                        showMenu();
                    }
                });
                break;
            default:
                console.log("Неверный выбор. Пожалуйста, выберите 1, 2, 3 или 0");
                showMenu();
                break;
        };
    });
}
const deleteNote = () => {
    if(notes.length === 0){
        console.log("Пока в приложении не заметок!");
        showMenu();
        return;
    };
    notes.forEach((note) => {
        console.log('=== Ваши заметки ===');
        console.log(`[${note.id}] * ${note.title}`);
    });
    rl.question('Введите номер заметки для удаления или 0 для отмены', (choice) => {
        let num = parseInt(choice);
        if(num === 0){
            console.log("Отмена удаления");
        }
        else if(num > 0 && num <= notes.length){
            notes.splice(num, - 1, 1);
            notes = helper.reindexIds(notes);
            fileManager.saveData(notes);
            console.log(`Заметка ${num} удалена`);
        }
        else{
            console.log(`Нет заметки с номером ${num} !`);
        }
        showMenu();
    });
};

welcomeApp();