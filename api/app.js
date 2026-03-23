const stat = document.getElementById("stat");
const content = document.getElementById("content");

let notes = []

async function loadNotes(){
    try{
        const res = await fetch("api/notes");
        notes = await res.json();
        stat.innerText = `Заметок ${notes.length}`;  
    }
    catch(error){
        console.log("ERROR", error.message);
        stat.innerText = `Заметки не найдены!`;
    }
}

async function addNote(){
    const title = prompt("Введите название ");
    const contentText = prompt("Напиши содержание ");  
    if( title === null || content === null){
        stat.innerText = `Все поля должны быть заполнены`;
        return;
    }
    
    try{
        const response = await fetch("api/notes", {
            method: "POST",
            headers: {"Content-Type" : "application/json"},
            body: JSON.stringify({title, content: contentText}),
        });
        
        if(response.ok){
            await loadNotes();  
            alert("Заметка добавлена!");
        }
    }
    catch(error){
        console.log("ERROR", error.message);
        alert("Ошибка при добавлении заметки");
    }
}

async function showNotes(){
        await loadNotes();
        if (notes.length === 0){
            content.innerText = "Пока нет заметок!"
        }
        let html = '<h3>Заметки: </h3>';
    
        notes.forEach( note => {
            html+=`
            <div>
            <small>[${note.id}] ${note.date} </small>
            <strong> ${note.title} </strong>
            ${note.content}
            </div>
            `;
        });
    
        content.innerHTML = html
   
}

async function deleteNote(){
    const id = prompt("Введите номер заметки для удаления");
    if(!id) return;
    
    try{
        const response = await fetch(`api/notes/${id}`, {
            method: "DELETE"
        });
        
        if(response.ok){
            await loadNotes();  
            await showNotes();  
            alert("Заметка удалена!");
        } else {
            alert("Заметка не найдена");
        }
    }
    catch(error){
        console.log("ERROR", error.message);
        alert("Ошибка при удалении заметки");
    }
}

showNotes();
loadNotes();