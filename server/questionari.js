const sqlite = require('sqlite3');
const db = new sqlite.Database('questionariDB.db', (err) => { if(err) throw err; });
const bcrypt = require('bcrypt');

exports.getUserById = (userId) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM utente WHERE id = ?;';
        db.get(sql, [userId], (err,row) => {
            if (err) reject(err);
            else if (row === undefined) resolve(null);
            else {
                const user = {id: row.id, username: row.username};
                resolve(user);
            }
        });
    });
}

exports.getUser = (username, password) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM utente WHERE username = ?;';
        db.get(sql, [username], (err, row) => {
            if (err) reject(err);
            else if (row === undefined) { resolve(null); }
            else {
                const user = {id: row.id, username: row.username};
                bcrypt.compare(password, row.hash).then(result => {
                    if(result) resolve(user);
                    else resolve(false);
                });
            }
        });
    });
}

exports.getUserSurveys = (userId) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT titolo, id FROM questionario WHERE utente=?;";
        db.all(sql, [userId], (err,rows) => {
            if(err) reject(err);
            else if(rows === undefined) resolve([]);
            else{ 
                const surveys = rows.map((q) => ({ id: q.id, title: q.titolo }));
                resolve(surveys);
            }
        });
    });
}

exports.getAllSurveys = () => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT titolo, q.id, username FROM questionario as q INNER JOIN utente as u ON q.utente = u.id;";
        db.all(sql, (err,rows) => {
            if(err) reject(err);
            else if(rows === undefined) resolve([]);
            else{
                const surveys = rows.map((q) => ({ id: q.id, title: q.titolo, author: q.username }));
                resolve(surveys);
            }
        });
    });
}

exports.getSurvey = (surveyId) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT q.id, titolo, username FROM questionario as q INNER JOIN utente as u ON q.utente = u.id WHERE q.id=?;";
        db.get(sql, [surveyId], (err,row) => {
            if(err) reject(err);
            else if(row === undefined) resolve(null);
            else{ 
                const survey = { id: row.id, title: row.titolo, author: row.username };
                resolve(survey);
            }
        });
    });
}

exports.getSurveyAnswersNumber = (surveyId) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM compilazione WHERE questionario=?;";
        db.all(sql, [surveyId], (err,rows) => {
            if(err) reject(err);
            else if(rows === undefined) resolve(0);
            else resolve(rows.length);
        })
    })
}

exports.getClosedQuestions = (surveyId) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM domanda_chiusa WHERE questionario=?;";
        db.all(sql, [surveyId], (err,rows) => {
            if(err) reject(err);
            else if(rows === undefined) resolve([]);
            else{ 
                const closed = rows.map((q) => ({ id: q.id, text: q.testo, min: q.min, max: q.max, position: q.posizione }));
                resolve(closed);
            }
        });
    });
}

exports.getClosedQuestion = (questionId) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM domanda_chiusa WHERE id=?;";
        db.get(sql, [questionId], (err,row) => {
            if(err) reject(err);
            else if(row === undefined) resolve([]);
            else{ 
                const closed = ({ id: row.id, text: row.testo, min: row.min, max: row.max, position: row.posizione });
                resolve(closed);
            }
        });
    });
}

exports.getOptions = (questionId) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM opzione WHERE domanda=?;";
        db.all(sql, [questionId], (err,rows) => {
            if(err) reject(err);
            else if(rows === undefined) resolve([]);
            else{ 
                const options = rows.map((o) => ({ id: o.id, question: o.domanda, text: o.testo }));
                resolve(options);
            }
        });
    });
}

exports.getOption = (optionId) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM opzione WHERE id=?";
        db.get(sql, [optionId], (err,row) => {
            if(err) reject(err);
            else if(row === undefined) resolve(undefined);
            else{
                const option = { questionId: row.domanda, text: row.testo }
                resolve(option);
            }
        });
    });
}

exports.getOpenQuestions = (surveyId) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM domanda_aperta WHERE questionario=?;";
        db.all(sql, [surveyId], (err,rows) => {
            if(err) reject(err);
            else if(rows === undefined) resolve([]);
            else{ 
                const open = rows.map((q) => ({ id: q.id, text: q.testo, required: q.obbligatorio, position: q.posizione }));
                resolve(open);
            }
        });
    });
}

exports.getOpenQuestion = (questionId) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM domanda_aperta WHERE id=?;";
        db.get(sql, [questionId], (err,row) => {
            if(err) reject(err);
            else if(row === undefined) resolve(undefined);
            else{ 
                const open = ({ id: row.id, text: row.testo, required: row.obbligatorio, position: row.posizione });
                resolve(open);
            }
        });
    });
}

exports.addCompiling = (surveyId, name) => {
    return new Promise((resolve, reject) => {
        const sql = "INSERT INTO compilazione VALUES(null, ?, ?);";
        db.run(sql, [surveyId, name], (err) => {
            if(err) reject(err);
            else{
                const sql2 = "SELECT last_insert_rowid() as id;";
                db.get(sql2, (err, row) => {
                    if(err) reject(err);
                    else resolve(row.id);
                });
            }
        });
    });
}

exports.addOpenAnswer = (compilingId, questionId, text) => {
    return new Promise((resolve, reject) => {
        const sql = "INSERT INTO risposta_aperta VALUES(?, ?, ?);";
        db.run(sql, [compilingId, questionId, text], (err) => {
            if(err) reject(err);
            else resolve("correct insert");
        });
    });
}

exports.addClosedAnswer = (compilingId, optionId, value) => {
    return new Promise((resolve, reject) => {
        const sql = "INSERT INTO risposta_chiusa VALUES(?, ?, ?);";
        db.run(sql, [compilingId, optionId, value], (err) => {
            if(err) reject(err);
            else resolve("correct insert");
        });
    });
}

exports.getCompilations = (questionId) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM compilazione WHERE questionario=?";
        db.all(sql, [questionId], (err, rows) => {
            if(err) reject(err);
            else if (rows === undefined) { resolve([]); }
            else {
                const compilations = rows.map((c) => ({ id: c.id, name: c.nome, questionId: c.questionario}))
                resolve(compilations);
            }
        });
    });
}

exports.getOpenAnswers = (compilingId) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM risposta_aperta WHERE compilazione=?;";
        db.all(sql, [compilingId], (err,rows) => {
            if(err) reject(err);
            else if(rows === undefined) resolve([]);
            else{ 
                const open = rows.map((a) => ({ answer: a.testo, questionId: a.domanda }));
                resolve(open);
            }
        });
    });
}

exports.getOpenAnswer = (compilingId, questionId) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM risposta_aperta WHERE compilazione=? AND domanda=?;";
        db.get(sql, [compilingId, questionId], (err,row) => {
            if(err) reject(err);
            else if(row === undefined) resolve(undefined);
            else{ 
                const open = { answer: row.testo };
                resolve(open);
            }
        });
    });
}

exports.getClosedAnswers = (compilingId) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM risposta_chiusa WHERE compilazione=?;";
        db.all(sql, [compilingId], (err,rows) => {
            if(err) reject(err);
            else if(rows === undefined) resolve([]);
            else{ 
                const closed = rows.map((a) => ({ value: a.selezione, optionId: a.opzione }));
                resolve(closed);
            }
        });
    });
}

exports.getClosedAnswer = (compilingId, optionId) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM risposta_chiusa WHERE compilazione=? AND opzione=?;";
        db.get(sql, [compilingId,optionId], (err,row) => {
            if(err) reject(err);
            else if(row === undefined) resolve(undefined);
            else{ 
                const closed = { value: row.selezione };
                resolve(closed);
            }
        });
    });
}

exports.addSurvey = (username, title) => {
    return new Promise((resolve, reject) => {
        const sql = "INSERT INTO questionario VALUES(null, ?, ?);";
        db.run(sql, [username, title], (err) => {
            if(err) reject(err);
            else{
                const sql2 = "SELECT last_insert_rowid() as id;";
                db.get(sql2, (err, row) => {
                    if(err) reject(err);
                    else resolve(row.id);
                });
            }
        });
    });
}

exports.addOpenQuestion = (surveyId, text, required, position) => {
    return new Promise((resolve, reject) => {
        const sql = "INSERT INTO domanda_aperta VALUES(null, ?, ?, ?, ?);";
        db.run(sql, [surveyId, text, required, position], (err) => {
            if(err) reject(err);
            else resolve("correct insert");
        });
    });
}

exports.addClosedQuestion = (surveyId, text, min, max, position) => {
    return new Promise((resolve, reject) => {
        const sql = "INSERT INTO domanda_chiusa VALUES(null, ?, ?, ?, ?, ?);";
        db.run(sql, [surveyId, text, min, max, position], (err) => {
            if(err) reject(err);
            else{
                const sql2 = "SELECT last_insert_rowid() as id;";
                db.get(sql2, (err, row) => {
                    if(err) reject(err);
                    else resolve(row.id);
                });
            }
        });
    });
}

exports.addOption = (questionId, text) => {
    return new Promise((resolve, reject) => {
        const sql = "INSERT INTO opzione VALUES(null, ?, ?);";
        db.run(sql, [questionId, text], (err) => {
            if(err) reject(err);
            else resolve("correct insert");
        });
    });
}