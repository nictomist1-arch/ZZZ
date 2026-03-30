const http = require("http");
const fs = require("fs").promises;
const path = require("path");

const helper = require('./utils/helper');
const fileManager = require('./utils/fileManager');

let notes = fileManager.loadData();

const server = http.createServer(async (req, res) => {
    const {url, method} = req;
    
    try {
        if( url === '/' && method === 'GET'){
            const html = await fs.readFile(path.join(__dirname, "public/index.html"), "utf-8");
            res.writeHead(200, {"Content-Type" : "text/html"});
            res.end(html);
            return;
        }
        
        if( url === '/api/app.js' && method === 'GET'){
            const js = await fs.readFile(path.join(__dirname, "api/app.js"), "utf-8");
            res.writeHead(200, {"Content-Type" : "application/javascript"});
            res.end(js);
            return;
        }

        if ( url === "/api/notes" && method === 'GET'){
            res.writeHead(200, {"Content-Type" : "application/json"});
            res.end(JSON.stringify(notes));
            return;
        }

        if ( url === "/api/notes" && method === 'POST'){
            let body = "";
            req.on("data", (chunk) => body += chunk);
            req.on("end", async() => {
                try {
                    const {title, content} = JSON.parse(body);
                    
                    if (!title || title.trim() === "" || !content || content.trim() === "") {
                        res.writeHead(400, {"Content-Type": "application/json"});
                        res.end(JSON.stringify({success: false, message: "Название и содержание не могут быть пустыми"}));
                        return;
                    }
                    
                    const newNote = {
                        id: notes.length + 1,
                        title: title.trim(),
                        content: content.trim(),
                        date: helper.formatDate()
                    };
                    notes.push(newNote);
                    fileManager.saveData(notes);
                    res.writeHead(200, {"Content-Type": "application/json"});
                    res.end(JSON.stringify({success: true, note: newNote}));
                } catch (error) {
                    console.error("Ошибка при добавлении заметки:", error);
                    res.writeHead(500, {"Content-Type": "application/json"});
                    res.end(JSON.stringify({success: false, message: "Ошибка сервера"}));
                }
            });
            return;
        }

        if (url.startsWith("/api/notes/") && method === 'PUT'){
            const id = parseInt(url.split('/')[3]);
            
            if (isNaN(id)) {
                res.writeHead(400, {"Content-Type": "application/json"});
                res.end(JSON.stringify({success: false, message: "Неверный ID заметки"}));
                return;
            }
            
            let body = "";
            req.on("data", (chunk) => body += chunk);
            req.on("end", async() => {
                try {
                    const {title, content} = JSON.parse(body);
                    
                    if (!title || title.trim() === "" || !content || content.trim() === "") {
                        res.writeHead(400, {"Content-Type": "application/json"});
                        res.end(JSON.stringify({success: false, message: "Название и содержание не могут быть пустыми"}));
                        return;
                    }
                    
                    const index = notes.findIndex(note => note.id === id);
                    
                    if(index !== -1){
                        notes[index] = {
                            ...notes[index],
                            title: title.trim(),
                            content: content.trim(),
                            date: helper.formatDate()
                        };
                        fileManager.saveData(notes);
                        res.writeHead(200, {"Content-Type": "application/json"});
                        res.end(JSON.stringify({success: true, note: notes[index]}));
                    } else {
                        res.writeHead(404, {"Content-Type": "application/json"});
                        res.end(JSON.stringify({success: false, message: "Заметка не найдена"}));
                    }
                } catch (error) {
                    console.error("Ошибка при редактировании заметки:", error);
                    res.writeHead(500, {"Content-Type": "application/json"});
                    res.end(JSON.stringify({success: false, message: "Ошибка сервера"}));
                }
            });
            return;
        }

        if (url === "/api/notes" && method === 'DELETE'){
            let body = "";
            req.on("data", (chunk) => body += chunk);
            req.on("end", async() => {
                try {
                    const {id} = JSON.parse(body);
                    const index = notes.findIndex(note => note.id === id);
                    
                    if(index !== -1){
                        notes.splice(index, 1);
                        notes = helper.reindexIds(notes);
                        fileManager.saveData(notes);
                        res.writeHead(200, {"Content-Type": "application/json"});
                        res.end(JSON.stringify({success: true}));
                    } else {
                        res.writeHead(404, {"Content-Type": "application/json"});
                        res.end(JSON.stringify({success: false, message: "Заметка не найдена"}));
                    }
                } catch (error) {
                    console.error("Ошибка при удалении заметки:", error);
                    res.writeHead(500, {"Content-Type": "application/json"});
                    res.end(JSON.stringify({success: false, message: "Ошибка сервера"}));
                }
            });
            return;
        }

        if (url.startsWith("/api/notes/") && method === 'DELETE'){
            const id = parseInt(url.split('/')[3]);
            
            if (isNaN(id)) {
                res.writeHead(400, {"Content-Type": "application/json"});
                res.end(JSON.stringify({success: false, message: "Неверный ID заметки"}));
                return;
            }
            
            const index = notes.findIndex(note => note.id === id);
            
            if(index !== -1){
                notes.splice(index, 1);
                notes = helper.reindexIds(notes);
                fileManager.saveData(notes);
                res.writeHead(200, {"Content-Type": "application/json"});
                res.end(JSON.stringify({success: true}));
            } else {
                res.writeHead(404, {"Content-Type": "application/json"});
                res.end(JSON.stringify({success: false, message: "Заметка не найдена"}));
            }
            return;
        }
        
        res.writeHead(404, {"Content-Type": "application/json"});
        res.end(JSON.stringify({success: false, message: "Маршрут не найден"}));
        
    } catch (error) {
        console.error("Критическая ошибка сервера:", error);
        res.writeHead(500, {"Content-Type": "application/json"});
        res.end(JSON.stringify({success: false, message: "Внутренняя ошибка сервера"}));
    }
});

server.listen(5001, () =>{
    console.log("Сервер запущен http://localhost:5001");
});