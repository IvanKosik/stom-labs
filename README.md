# stom-labs

- [ ]. Искать лучшую дистанцию для каждого слова по отдельности
- [X]. Закодировать базу перед релизом
- [X]. Заблокировать ввод ответа, если hint === answer

--------------------------------------------------------------------------------

	How to Edit Labs
1) Setup Node.js (tested with 10.15.0 LTS and 11.6.0)

https://nodejs.org/en/

2) In folder with program run:

npm install && npm start

// npm install will install all needed packages
// npm start will run electron application ( https://electronjs.org/ )
// after first npm install, just use
	npm start
// to run app

3) To build exe

npm run dist

// build results will be in the dist folder

4) To change labs text

edit db_clean.json file
!!! then copy it (create backup, because next step will REWRITE this file) !!!
encode answers inside this edited db_clean.json file, using

node enc-script.js

encoded file will rewrite current db_clean.json
rename this db_clean.json to db.json

and run app, using
npm start

or build it, using
npm run dist

before git pull, rename backup of edited (NOT encoded) db_clean_copy.json into db_clean.json
