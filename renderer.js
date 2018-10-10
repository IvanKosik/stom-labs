const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const CryptoJS = require("crypto-js");

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
    
    taskList.appendChild(ul);

    let tasks = db.get("labs").filter({"lesson": lesson}).map("part").uniq().value();
    ul = document.querySelector(`ul[data-lesson="${lesson}"]`);

    for (const task of tasks) {
        const li = document.createElement("li");
        li.innerHTML = `<a href="#" data-task=${[lesson,task]}>Задание ${task}</a>`;
        ul.appendChild(li);
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

            document.getElementById("section_name").textContent = current.section[0].toUpperCase() + current.section.slice(1).toLowerCase();
            document.querySelector("main div > h5:first-child").textContent = `Лабораторное занятие №${lesson}. ${current.title}`;
            document.querySelector("main div > p").textContent = current.task;

            const template = Number(current.template);

            if (template === 1) {

                const template = refresh_main("template-1");

                for (const image of current["images"]) {

                    let img = new Image();
                    img.src = image.src;
                    img.classList.add("materialboxed", "responsive-img");

                    const line = document.createElement("div");
                    line.classList.add("flex-rows");

                    const image_div = document.createElement("div");
                    image_div.appendChild(img);

                    const questions = db.get("labs").find({"lesson": lesson, "part": part}).get("questions").filter({"to": image.src}).value()
                    
                    const input_div = document.createElement("div");
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
                subtitle.classList.add("center-align","img-line-header")
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

    const list = [... template1_list, ...template2_list];

    for (elem of list) {
        elem.addEventListener("input", evaluate_input);
    }
}

window.addEventListener("resize", () => {
    const image_list = document.getElementById("image-list");
    const list = document.getElementById("question-list");
    list.style.height = "0px";
    list.style.height = image_list.offsetHeight + "px";
});


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