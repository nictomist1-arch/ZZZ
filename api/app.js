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

// Функция для показа психоделических уведомлений
function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.style.background = isError 
        ? 'linear-gradient(45deg, #ff0000, #ff00ff, #ff0000)'
        : 'linear-gradient(45deg, #ff00ff, #00ffff, #ff00ff)';
    toast.classList.add('show');
    
    // Взрыв эмодзи
    for(let i = 0; i < 20; i++) {
        setTimeout(() => createRandomEmoji(), i * 50);
    }
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

async function showNotes() {
    const container = document.getElementById("content");
    container.innerHTML = `
        <div class="loading">
            <div class="loader"></div>
            <p style="color: white; animation: textCrazy 0.1s infinite;">🌀 ЗАГРУЗКА БЕЗУМИЯ... 🌀</p>
        </div>
    `;
    
    // Тряска экрана
    document.body.style.animation = 'shake 0.1s infinite';
    setTimeout(() => {
        document.body.style.animation = '';
    }, 500);
    
    try {
        const res = await fetch("api/notes");
        notes = await res.json();
        
        if (notes.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="icon">🌀⚡🌈🔥💀</div>
                    <p>ХАОС ЖДЕТ ТВОИХ ЗАМЕТОК!</p>
                    <small>НАЖМИ КНОПКУ И СОЗДАЙ БЕЗУМИЕ</small>
                </div>
            `;
            document.getElementById("stat").innerHTML = `💀 ВСЕГО ЗАМЕТОК: 0 💀`;
            return;
        }
        
        let html = "";
        notes.forEach(note => {
            const title = note.title && note.title !== "null" && note.title.trim() !== "" 
                ? note.title 
                : "🌀 БЕЗУМНАЯ ЗАМЕТКА 🌀";
            const contentText = note.content && note.content !== "null" && note.content.trim() !== "" 
                ? note.content 
                : "💀 ХАОС И АНИМАЦИЯ 💀";
            const date = note.date || "🌪️ ВРЕМЯ НЕ ИМЕЕТ ЗНАЧЕНИЯ 🌪️";
            
            const safeTitle = escapeHtml(title);
            const safeContent = escapeHtml(contentText);
            
            html += `
                <div class="note-card" style="animation: crazySlide 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;">
                    <div class="note-header">
                        <span class="note-id">#${note.id} 🎪</span>
                        <span class="note-date">${date}</span>
                    </div>
                    <div class="note-title">${safeTitle}</div>
                    <div class="note-content">${safeContent}</div>
                </div>
            `;
        });
        
        container.innerHTML = html;
        document.getElementById("stat").innerHTML = `🌀 ВСЕГО ЗАМЕТОК: ${notes.length} 🌀`;
        
        document.querySelectorAll('.note-card').forEach((card, index) => {
            card.style.animationDelay = `${index * 0.05}s`;
        });
        
        showToast(`🌀 ${notes.length} ЗАМЕТОК В ХАОСЕ! 🌀`);
        
    } catch (error) {
        console.log("ERROR", error.message);
        container.innerHTML = `
            <div class="empty-state">
                <div class="icon">💀⚠️💀</div>
                <p>ОШИБКА БЕЗУМИЯ!</p>
                <small>${error.message}</small>
            </div>
        `;
        showToast("💀 ОШИБКА! ХАОС ВЫШЕЛ ИЗ-ПОД КОНТРОЛЯ 💀", true);
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

async function deleteNote(){
    try {
        const res = await fetch("api/notes");
        const notes = await res.json();
        
        if(notes.length === 0) {
            alert("Нет заметок для удаления!");
            return;
        }
        
        const list = notes.map(note => `[${note.id}] ${note.title || "Без названия"}`).join("\n");
        const id = prompt(`Список заметок:\n${list}\n\nВведите номер заметки для удаления:`);
        
        if(!id) return;
        
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

async function name(params) {
    
}

loadNotes();