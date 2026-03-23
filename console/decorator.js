class ConsoleDecorator {

    static drawLine(lines, format){
        if(format === 1){
        console.log(`=`.repeat(lines));
        }
        else if(format === 2){
            console.log(`-`.repeat(lines));
        }
        else if(format === 3){
            console.log(`~`.repeat(lines));
        }
        else {
            console.log(`_`.repeat(lines));
        }
    }

    static showAllFormatNotes(notes){
        notes.forEach((note) => this.showFormatNote(note));
    }

    static showFormatNote(note){
        const width = 30; 

        const splitText = (text, maxWidth) => {
            text = String(text);
            const lines = [];
            for (let i = 0; i < text.length; i += maxWidth) {
                lines.push(text.substring(i, i + maxWidth));
            }
            return lines;
        };
        console.log(` ┌` + `─`.repeat(width) + `──┐`);
        console.log(` │ ${String(note.id).padEnd(width)} │`);
        const contentLines = splitText(note.content, width);
        contentLines.forEach((line, index) => {
            if (index === 0) {
                console.log(` │ ${line.padEnd(width)} │`);
            } else {
                console.log(` │ ${line.padEnd(width)} │`);
            }
        });
        console.log(` └` + `─`.repeat(width) + `──┘`);
    }
}
module.exports = ConsoleDecorator;