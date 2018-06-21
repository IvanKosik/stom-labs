console.log("from renderer.js")

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('db.json')
const db = low(adapter)

let lessons =  db.get("labs").map("lesson").uniq().value();

for (const lesson of lessons) {
    
    const taskList = document.querySelector("#labs .collapsible");

    let ul = document.createElement("li");
    ul.innerHTML = `<div class="collapsible-header">
                        <i class="material-icons">arrow_drop_down</i>
                        Лабораторное занятие ${lesson}
                    </div>
                    <div class="collapsible-body">
                        <ul data-lesson=${lesson}>
                        </ul>
                    </div>`
    
    //ul.dataset.lesson = lesson;
    console.log(ul);
    taskList.appendChild(ul);

    let tasks = db.get("labs").filter({"lesson": lesson}).map("part").uniq().value();
    ul = document.querySelector(`ul[data-lesson="${lesson}"]`);

    for (const task of tasks) {
        console.log(task, ul);
        const li = document.createElement("li");
        li.innerHTML = `<a href="#" data-task=${[lesson,task]}>Задание ${task}</a>`;
        console.log(li);
        ul.appendChild(li);
    }
}

const tasks = document.getElementsByTagName('a');

for (let task of tasks) {
    if (task.hasAttribute("data-task")) {
        task.addEventListener("click", (event) => {

            console.log(event);
            console.log(event.target.dataset.task)

            if (document.querySelector("ul[data-lesson] .active")) {
                if (document.querySelector("ul[data-lesson] .active") === event.target.parentElement) {
                    return;
                }
                document.querySelector("ul[data-lesson] .active").classList.toggle("active");
            }

            event.target.parentElement.classList.add("active");

            let [lesson,part] = event.target.dataset.task.split(",").map(Number);
            let current = db.get("labs").find({"lesson":lesson, "part":part}).value();

            document.querySelector("main div > h5").textContent = `Лабораторное занятие №${lesson}`;
            document.querySelector("main div > h6").textContent = current.subtitle;
            document.querySelector("main div > p").textContent = current.task;

            console.log(current);
            let image_list = document.getElementById("image-list");
            let list = document.getElementById("question-list");
            //let questions = document.querySelector('div.questions');
            
            image_list.innerHTML = "";
            list.innerHTML = "";
            list.style.height = "0px";
            console.log(image_list.offsetHeight, list.offsetHeight);

            for (const image of current["images"]) {

                let img = new Image();
                img.onload = () => {
                    list.style.height = image_list.offsetHeight + "px";
                    console.log("image-list height:", image_list.offsetHeight);
                }
                img.classList.add("materialboxed","responsive-img");

                image_list.appendChild(img)
                let p = document.createElement("p");
                p.classList.add("center-align");
                p.textContent = image.caption;
                image_list.appendChild(p)
                img.src = image.src;

                //image_list.innerHTML = image_list.innerHTML + `<img class="materialboxed responsive-img" src=${image.src}>`
                //image_list.innerHTML = image_list.innerHTML + `<p class="center-align">${image.caption}</p>`
            }

            //questions.style.height = image_list.offsetHeight + "px";

            for (let i = 0; i < current["questions"].length; i++) {
                list.innerHTML = list.innerHTML + `
                <div class="input-field">
                    <input id="${ 'q' + i }" type="text" class="validate">
                    <label class="" for="${ 'q' + i }">${ (i+1).toString() + '. ' + current.questions[i].hint}</label>
                    <p><span>${(i+1).toString()}.</span>${current.questions[i].hint}</p>
                </div>
                `
            console.log("list height:", list.offsetHeight);
            }

            // Reassign eventHandler
            updateInputCheck();

            // reassign Materialize js
            const elems = document.querySelectorAll('.materialboxed');
            const instances = M.Materialbox.init(elems);

        });
    }
}

function updateInputCheck() {

    list = document.querySelectorAll("#question-list div.input-field");

    for (elem of list) {

        elem.addEventListener("input", (e) => {

            const answer_tag = document.querySelector("ul[data-lesson] .active a");
            const [lesson,part] = answer_tag.dataset.task.split(",").map(Number);
            const answer_id = Number(e.target.id[1]);
            console.log(lesson, part, answer_id);
            const answer = db.get("labs").find({"lesson": lesson, "part": part}).value().questions[answer_id].answer;
            console.log(answer);
            const res = levenshtein(e.target.value, answer);
            console.log(res)
            console.log(e.target.classList)

            if (res < 1) {
                e.target.disabled = true;
            }
    
            
            if (res > 10) {
                e.target.classList.remove('low-distance','medium-distance');
                e.target.classList.add('high-distance');
                console.log(e.target.classList);
            } else if (res > 4) {
                e.target.classList.remove('high-distance','low-distance');
                e.target.classList.add('medium-distance');
                console.log(e.target.classList);
            } else {
                e.target.classList.remove('high-distance','medium-distance');
                e.target.classList.add('low-distance');
                console.log(e.target.classList);

                e.target.nextElementSibling.nextElementSibling.textContent = `${Number(e.target.id[1] + 1)}. ${e.target.value}`;
                e.target.nextElementSibling.nextElementSibling.classList.add("correct");
            }
        });
        
        elem.addEventListener("change", e => {

            const answer_tag = document.querySelector("ul[data-lesson] .active a");
            const [lesson,part] = answer_tag.dataset.task.split(",").map(Number);
            const answer_id = Number(e.target.id[1]);
            const answer = db.get("labs").find({"lesson":lesson, "part":part}).value().question[answer_id].answer;
            const res = levenshtein(e.target.value, answer);
            if (res > 3) {
                e.target.value = "";
            } 
        });
    }

}


const print = document.getElementById("print");

print.addEventListener("click", () => {
    window.print();
    //webContents.print({silent: false, printBackground: false, deviceName: ''});
})

        /*
    window.addEventListener("resize", () => {
    let img_list = document.getElementById('image-list');
    console.log(img_list.clientHeight);
    let list = document.getElementById('answer-list');

    list.style.height = (img_list.clientHeight - 50) + 'px';
    })*/

    //require('electron')
    //console.log(require('electron').remote.getGlobal('sharedObject').someProperty)


function levenshtein(a, b) {

    a = a.toLowerCase();
    b = b.toLowerCase();

    if(a.length === 0) return b.length;
    if(b.length === 0) return a.length;
    
    var matrix = [];
    
    // increment along the first column of each row
    var i;
    for(i = 0; i <= b.length; i++){
        matrix[i] = [i];
    }
    
    // increment each column in the first row
    var j;
    for(j = 0; j <= a.length; j++){
        matrix[0][j] = j;
    }
    
    // Fill in the rest of the matrix
    for(i = 1; i <= b.length; i++){
        for(j = 1; j <= a.length; j++){
        if(b.charAt(i-1) == a.charAt(j-1)){
            matrix[i][j] = matrix[i-1][j-1];
        } else {
            matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, // substitution
                                    Math.min(matrix[i][j-1] + 1, // insertion
                                            matrix[i-1][j] + 1)); // deletion
        }
        }
    }
    
    return matrix[b.length][a.length];
}
    
M.validate_field = function() {
    console.log(this)
}