const http = require("http");
const fs = require("fs").promises;
const path = require("path");

const helper = require('./utils/helper');
const fileManager = require('./utils/fileManager');

let notes = fileManager.loadData();

const server = http.createServer(async (req, res) => {
    const {url, method} = req;
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
        req.on("data" , (chunk) => body += chunk);
        req.on("end", async() => {
            const {title, content} = JSON.parse(body);
            const newNote = {
                    id: notes.length + 1,
                    title: title,
                    content: content,
                    date: helper.formatDate()
                };
                notes.push(newNote);
                fileManager.saveData(notes);
        });
        res.writeHead(200, {"Content-Type" : "application/json"});
        res.end(JSON.stringify({succes : true}));
        return;
    }

    if (url === "/api/notes" && method === 'DELETE'){
        let body = "";
        req.on("data", (chunk) => body += chunk);
        req.on("end", async() => {
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
        });
        return;
    }

    if (url.startsWith("/api/notes/") && method === 'DELETE'){
        const id = parseInt(url.split('/')[3]);
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
    
    async function deleteNote(){
        
    }
});

server.listen(5001, () =>{
    console.log("Сервер запущен http://localhost:5001");
});