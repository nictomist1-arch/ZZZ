const stat = document.getElementById("stat");
const content = document.getElementById("content");

let notes = []

async function loadNotes(){
    try{
        const res = await fetch("api/notes");
        notes = await res.json();
        stat.innerHTML = `ЗАМЕТОК: ${notes.length}`;
    }
    catch(error){
        console.log("ERROR", error.message);
        stat.innerHTML = `ОШИБКА!`;
    }
}

async function addNote(){
    const title = prompt("Введите название заметки:", "Моя заметка");
    if(title === null) return;
    
    const contentText = prompt("Введите содержание заметки:", "Здесь будет текст...");
    if(contentText === null) return;
    
    if(title.trim() === "" || contentText.trim() === ""){
        showToast("Название и содержание не могут быть пустыми!", "error");
        return;
    }
    
    try{
        const response = await fetch("api/notes", {
            method: "POST",
            headers: {"Content-Type" : "application/json"},
            body: JSON.stringify({title: title.trim(), content: contentText.trim()}),
        });
        
        if(response.ok){
            await loadNotes();  
            await showNotes();
            showToast("Заметка создана! +1 опыт", "success");
        } else {
            const error = await response.json();
            showToast(error.message || "Ошибка создания!", "error");
        }
    }
    catch(error){
        console.log("ERROR", error.message);
        showToast("Ошибка! Заметка не создана", "error");
    }
}

async function editNote() {
    if (notes.length === 0) {
        showToast("Книга пуста! Сначала создайте заметку", "error");
        return;
    }
    
    try {
        const res = await fetch("api/notes");
        const currentNotes = await res.json();
        
        if(currentNotes.length === 0) {
            showToast("Книга пуста!", "error");
            return;
        }
        
        const list = currentNotes.map(note => `[${note.id}] ${note.title || "Без названия"}`).join("\n");
        const idInput = prompt(`Список заметок:\n${list}\n\nВведите ID заметки для правки:`);
        
        if(!idInput) return;
        
        const id = parseInt(idInput);
        const noteToEdit = currentNotes.find(n => n.id === id);
        
        if(!noteToEdit) {
            showToast("Заметка не найдена!", "error");
            return;
        }
        
        const newTitle = prompt("Новое название:", noteToEdit.title);
        if(newTitle === null) return;
        
        const newContent = prompt("Новое содержание:", noteToEdit.content);
        if(newContent === null) return;
        
        if(newTitle.trim() === "" || newContent.trim() === "") {
            showToast("Название и содержание не могут быть пустыми!", "error");
            return;
        }
        
        const response = await fetch(`api/notes/${id}`, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({title: newTitle.trim(), content: newContent.trim()}),
        });
        
        if(response.ok) {
            await loadNotes();
            await showNotes();
            showToast(`Заметка #${id} изменена!`, "success");
        } else {
            const error = await response.json();
            showToast(error.message || "Ошибка правки!", "error");
        }
    } catch(error) {
        console.log("ERROR", error.message);
        showToast("Ошибка при правке заметки", "error");
    }
}

async function showNotes() {
    const container = document.getElementById("content");
    container.innerHTML = `
        <div class="loading">
            <div class="loader"></div>
            <p>ЗАГРУЗКА КНИГИ...</p>
        </div>
    `;
    
    try {
        const res = await fetch("api/notes");
        notes = await res.json();
        
        if (notes.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="icon"></div>
                    <p>КНИГА ПУСТА</p>
                    <small>НАЖМИ "СОЗДАТЬ" ЧТОБЫ НАЧАТЬ</small>
                </div>
            `;
            stat.innerHTML = `ЗАМЕТОК: 0`;
            return;
        }
        
        let html = "";
        notes.forEach(note => {
            const title = note.title && note.title.trim() !== "" 
                ? escapeHtml(note.title) 
                : "Без названия";
            const contentText = note.content && note.content.trim() !== "" 
                ? escapeHtml(note.content) 
                : "Нет содержания";
            const date = note.date || "Дата не указана";
            
            html += `
                <div class="note-card">
                    <div class="note-header">
                        <span class="note-id">#${note.id}</span>
                        <span class="note-date">${escapeHtml(date)}</span>
                    </div>
                    <div class="note-title">${title}</div>
                    <div class="note-content">${contentText}</div>
                    <div class="note-actions">
                        <button class="edit-btn" onclick="editNoteById(${note.id})">
                            ПРАВИТЬ
                        </button>
                        <button class="delete-btn" onclick="deleteNoteById(${note.id})">
                            УДАЛИТЬ
                        </button>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
        stat.innerHTML = `ЗАМЕТОК: ${notes.length}`;
        
        showToast(`Загружено ${notes.length} заметок!`, "success");
        
    } catch (error) {
        console.log("ERROR", error.message);
        container.innerHTML = `
            <div class="empty-state">
                <div class="icon"></div>
                <p>ОШИБКА ЗАГРУЗКИ!</p>
                <small>${error.message}</small>
            </div>
        `;
        showToast("Ошибка загрузки заметок!", "error");
    }
}

async function editNoteById(noteId) {
    try {
        const res = await fetch("api/notes");
        const currentNotes = await res.json();
        const noteToEdit = currentNotes.find(n => n.id === noteId);
        
        if(!noteToEdit) {
            showToast("Заметка не найдена!", "error");
            return;
        }
        
        const newTitle = prompt("✏️ Редактирование названия:", noteToEdit.title);
        if(newTitle === null) return;
        
        const newContent = prompt("Редактирование содержания:", noteToEdit.content);
        if(newContent === null) return;
        
        if(newTitle.trim() === "" || newContent.trim() === "") {
            showToast("Название и содержание не могут быть пустыми!", "error");
            return;
        }
        
        const response = await fetch(`api/notes/${noteId}`, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({title: newTitle.trim(), content: newContent.trim()}),
        });
        
        if(response.ok) {
            await loadNotes();
            await showNotes();
            showToast(`✏️ Заметка "${newTitle}" обновлена!`, "success");
        } else {
            const error = await response.json();
            showToast(error.message || " Ошибка обновления!", "error");
        }
    } catch(error) {
        console.log("ERROR", error.message);
        showToast("Ошибка при редактировании", "error");
    }
}

async function deleteNoteById(noteId) {
    if(confirm(`Удалить заметку #${noteId}?\nЭто действие нельзя отменить!`)){
        try {
            const response = await fetch(`api/notes/${noteId}`, {
                method: "DELETE"
            });
            
            if(response.ok){
                await loadNotes();  
                await showNotes();  
                showToast(`Заметка #${noteId} удалена!`, "success");
            } else {
                const error = await response.json();
                showToast(error.message || "Ошибка удаления!", "error");
            }
        }
        catch(error){
            console.log("ERROR", error.message);
            showToast("Ошибка при удалении", "error");
        }
    }
}

async function deleteNote(){
    try {
        const res = await fetch("api/notes");
        const notes = await res.json();
        
        if(notes.length === 0) {
            showToast("Книга пуста!", "error");
            return;
        }
        
        const list = notes.map(note => `[${note.id}] ${note.title || "Без названия"}`).join("\n");
        const id = prompt(`Список заметок:\n${list}\n\nВведите ID заметки для удаления:`);
        
        if(!id) return;
        
        if(confirm(`Удалить заметку #${id}?\nЭто действие нельзя отменить!`)){
            const response = await fetch(`api/notes/${id}`, {
                method: "DELETE"
            });
            
            if(response.ok){
                await loadNotes();  
                await showNotes();  
                showToast(`Заметка #${id} удалена из книги!`, "success");
            } else {
                const error = await response.json();
                showToast(error.message || "⚠️ Заметка не найдена!", "error");
            }
        }
    }
    catch(error){
        console.log("ERROR", error.message);
        showToast("Ошибка при удалении", "error");
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showToast(message, type = "success") {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

loadNotes();