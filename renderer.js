const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const CryptoJS = require('crypto-js');

const adapter = new FileSync('db.json')

const db = low(adapter)

const with_cypher = true;
    
const cypher_tools = (with_cypher) => {
    if (with_cypher === true) {
        const secret_key = 'Alex Glinsky 2018'
        const decrypt = function(cipher, secret_key) {
            return CryptoJS.AES.decrypt( cipher, secret_key).toString(CryptoJS.enc.Utf8);
        }
        return [secret_key, decrypt]
    } else {
        const secret_key = undefined;
        const decrypt = function(string, secret_key) {
            return string;
        }
        return [secret_key, decrypt]
    }
}

const [secret_key, decrypt] = cypher_tools(with_cypher);

let lessons =  db.get("labs").map("lesson").uniq().value();


var header = document.getElementById("section_name");
header.innerHTML = header.innerHTML.toUpperCase();


for (const lesson of lessons) {

    const taskList = document.querySelector("#labs .collapsible");
    let title = db.get("labs").find({"lesson":lesson}).value().title;

    if (lesson === 0) {

        let ul = document.createElement("li");
        //ul.classList.add("tooltipped");
        //ul.setAttribute("data-position","right");
        //ul.setAttribute("data-tooltip", title); // Add full lab name here
        ul.innerHTML = `<div class="collapsible-header">
                            <i class="material-icons">arrow_drop_down</i>
                            Введение
                        </div>
                        <div class="collapsible-body">
                            <ul data-lesson=${lesson}>
                            </ul>
                        </div>`
        taskList.appendChild(ul);

        ul = document.querySelector(`ul[data-lesson="${lesson}"]`);

        let li = document.createElement("li");
        li.innerHTML = `<a href="#" data-task=${[lesson,0]}>Титульный лист</a>`;
        ul.appendChild(li);

        li = document.createElement("li");
        li.innerHTML = `<a href="#" data-task=${[lesson,1]}>Инструкция</a>`;
        ul.appendChild(li);

    } else {

        console.log(lesson);

        let ul = document.createElement("li");
        ul.classList.add("tooltipped");
        ul.setAttribute("data-position","right");
        ul.setAttribute("data-tooltip", title); // Add full lab name here
        ul.innerHTML = `<div class="collapsible-header">
                            <i class="material-icons">arrow_drop_down</i>
                            Лабораторное занятие ${lesson}
                        </div>
                        <div class="collapsible-body">
                            <ul data-lesson=${lesson}>
                            </ul>
                        </div>`
        
        taskList.appendChild(ul);

        let tasks = db.get("labs").filter({"lesson": lesson}).map("part").uniq().value();
        ul = document.querySelector(`ul[data-lesson="${lesson}"]`);

        for (const task of tasks) {
            const li = document.createElement("li");
            if (task === 0) {
                li.innerHTML = `<a href="#" data-task=${[lesson,task]}>Глоссарий</a>`; 
            } else {
                li.innerHTML = `<a href="#" data-task=${[lesson,task]}>Задание ${task}</a>`; 
            }
            ul.appendChild(li);
        }
    }
}

function refresh_main(template_id) {
    let templates = document.getElementById("templates");
    templates.innerHTML = "";

    const template = document.createElement("div");
    template.setAttribute("id", template_id);

    templates.appendChild(template);

    return template
}

function render_questions(questions, div) {
    for (let question of questions) {
        let [value, lclass] = ["",""];
        if ( question.hint === decrypt(question.answer, secret_key)) {
            value = question.label + ' ' + question.hint;
            lclass = "active invisible";
        }
        div.innerHTML += `
        <div class="input-field">
            <input id="${ 'q' + question.id }" type="text" class="validate" value="${ value }">
            <label class="${ lclass }" for="${ 'q' + question.id }">${ question.label + ' ' + question.hint}</label>
            <p><span>${ question.label }.</span>${ question.hint }</p>
        </div>
        `
    }
}

const tasks = document.getElementsByTagName('a');

for (let task of tasks) {
    if (task.hasAttribute("data-task")) {
        task.addEventListener("click", (event) => {

            if (document.querySelector("ul[data-lesson] .active")) {
                if (document.querySelector("ul[data-lesson] .active") === event.target.parentElement) {
                    return;
                }
                document.querySelector("ul[data-lesson] .active").classList.toggle("active");
            }

            event.target.parentElement.classList.add("active");

            let [lesson,part] = event.target.dataset.task.split(",").map(Number);
            let current = db.get("labs").find({"lesson":lesson, "part":part}).value();

            console.log(lesson, part, current)

            const template = Number(current.template);

            document.getElementById("section_name").textContent = current.section.toUpperCase();
            document.querySelector("main div > p").textContent = current.task;
            if (template === 0) {
                document.querySelector("main div > h5:first-child").textContent = `${current.title}`;
            } else {
                document.querySelector("main div > h5:first-child").textContent = `Лабораторное занятие №${lesson}. ${current.title}`;
            }


            if (template === 0) {

                if (part === 0) {

                    const template = refresh_main("template-0");

                    const image = current["images"][0];
                    let img = new Image();
                    img.src = image.src;
                    img.classList.add("materialboxed", "responsive-img");
    
                    const box = document.createElement("div");
                    box.classList.add("image-placeholder");
                    box.appendChild(img);
                    template.appendChild(box);

                } else {

                    const template = refresh_main("template-0");
                    const instructions = document.getElementById("documentation-modal").firstElementChild;
                    const block = document.createElement("div");
                    block.classList.add("block");
                    block.innerHTML = instructions.innerHTML;
                    template.appendChild(block);

                }


            } else if (template === 1) {

                const template = refresh_main("template-1");

                for (const image of current["images"]) {
                    const line = document.createElement("div");
                    line.classList.add("flex-rows");

                    const image_div = document.createElement("div");

                    let p = document.createElement("p");
                    p.classList.add("center-align", "img-line-header");
                    p.textContent = image.caption;
                    image_div.appendChild(p)

                    let img = new Image();
                    img.src = image.src;
                    img.classList.add("materialboxed", "responsive-img");
                    image_div.appendChild(img);

                    const questions = db.get("labs").find({"lesson": lesson, "part": part}).get("questions").filter({"to": image.src}).value()
                    
                    const input_div = document.createElement("div");
                    input_div.classList.add("top-margin");
                    render_questions(questions, input_div);

                    line.appendChild(image_div);
                    line.appendChild(input_div);

                    template.appendChild(line)
                }

            } else if (template === 2) {

                const template = refresh_main("template-2");

                const image_list = document.createElement("div");
                image_list.setAttribute("id","image-list");

                const question_list = document.createElement("div");
                question_list.setAttribute("id", "question-list")

                template.appendChild(image_list);
                template.appendChild(question_list);
    
                question_list.style.height = "0px";

                const subtitle = document.createElement("p"); // add classes to p
                subtitle.classList.add("center-align", "img-line-header");
                subtitle.textContent = current.subtitle;
                image_list.appendChild(subtitle);
    
                for (const image of current["images"]) {
    
                    let img = new Image();
                    img.onload = () => {
                        question_list.style.height = image_list.offsetHeight + "px";
                    }
                    img.classList.add("materialboxed","responsive-img");
    
                    image_list.appendChild(img)
                    let p = document.createElement("p");
                    p.classList.add("center-align");
                    p.textContent = image.caption;
                    image_list.appendChild(p)
                    img.src = image.src;

                }

                render_questions(current.questions, question_list)

                for (child of question_list.children) { 
                    if (child.firstElementChild.value !== "") {
                        child.firstElementChild.classList.add('low-distance');
                        child.firstElementChild.disabled = true;
                    }
                }

            } else if (template === 3) {

                const template = refresh_main("template-3");
                const text_div = document.createElement("div");
                const paragraphs = current.paragraph;
                for (const paragpaph of paragraphs) {
                    const p = document.createElement("p");
                    p.innerHTML = paragpaph;
                    text_div.appendChild(p);
                }
                template.appendChild(text_div);
                
            }

            // Reassign eventHandler
            updateInputCheck();

            // reassign Materialize js
            const elems = document.querySelectorAll('.materialboxed');
            const instances = M.Materialbox.init(elems);

        });
    }
}

function evaluate_input(e) {

    console.log(this, e)

    const answer_tag = document.querySelector("ul[data-lesson] .active a");
    const [lesson,part] = answer_tag.dataset.task.split(",").map(Number);
    const answer_id = Number(e.target.id.slice(1));
    const value = db.get("labs").find({"lesson": lesson, "part": part}).get("questions").find({"id": answer_id}).value()
    
    let answer = value.answer;
    let label = value.label;

    answer = decrypt(answer, secret_key);

    const entered_answer = e.target.value;
    const [res, abs_res] = levenshtein(entered_answer, answer);

    if (res < 1) {
        e.target.disabled = true;
        e.target.nextElementSibling.classList.add("invisible");
        e.target.value = `${label} ${entered_answer}`;
    }
    
    if (abs_res > 0.4) {
        e.target.classList.remove('low-distance','medium-distance');
        e.target.classList.add('high-distance');
    } else if (abs_res > 0.15) {
        e.target.classList.remove('high-distance','low-distance');
        e.target.classList.add('medium-distance');
    } else {
        e.target.classList.remove('high-distance','medium-distance');
        e.target.classList.add('low-distance');

        e.target.nextElementSibling.nextElementSibling.textContent = `${Number( e.target.id[1]) + 1}. ${e.target.value}`;
        e.target.nextElementSibling.nextElementSibling.classList.add("correct");
    }
}

function updateInputCheck() {

    const template1_list = document.querySelectorAll("#templates .input-field");
    const template2_list = document.querySelectorAll("#question-list div.input-field"); 

    const list = [... template1_list, ... template2_list];

    for (elem of list) {
        elem.addEventListener("input", evaluate_input);
    }
}


const print = document.getElementById("print");


print.addEventListener("click", () => {
    window.print();
})


function levenshtein(a, b) {

    a = a.toLowerCase().replace(/[^а-яА-Я]/g, '') //(/\s/g,'');
    b = b.toLowerCase().replace(/[^а-яА-Я]/g, '') //(/\s/g,'');

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
    
    return [matrix[b.length][a.length] , matrix[b.length][a.length] / b.length];
}