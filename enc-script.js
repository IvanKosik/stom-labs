const secret_key = 'Alex Glinsky 2018'

const fs = require('fs');
const CryptoJS = require("crypto-js");

function encrypt(text, secret_key) {
    return CryptoJS.AES.encrypt( text, secret_key).toString();
}

function decrypt(cipher, secret_key) {
    return CryptoJS.AES.decrypt( cipher, secret_key).toString(CryptoJS.enc.Utf8);
}

let test_string = "my test string";

console.log(encrypt(test_string, secret_key));
console.log(decrypt(encrypt(test_string, secret_key), secret_key));

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('db_clean.json')
const db = low(adapter)

const lessons =  db.get("labs").map("lesson").uniq().value();

for (const lesson of lessons) {

    const parts = db.get("labs").filter({"lesson": lesson}).map("part").uniq().value();

    for (const part of parts) {

        if (part !== 0) {

            const questions = db.get("labs").find({"lesson":lesson, "part":part}).get("questions").value();

            for (const question of questions) {
    
                console.log(question.answer);
                if (question.answer === undefined) {
                    throw `${lesson} ${part} ${question}`
                }
               
    
                encryptedAnswer = encrypt(question.answer, secret_key);
                db.get("labs").find({"lesson":lesson, "part":part}).get("questions").find({"id": question.id}).set("answer", encryptedAnswer).write();
            }
        }
    }
}