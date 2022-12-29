-- SQLite
create table utente(id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL, hash TEXT NOT NULL);
create table questionario(id INTEGER PRIMARY KEY AUTOINCREMENT, utente INTEGER NOT NULL, titolo TEXT NOT NULL, FOREIGN KEY(utente) REFERENCES utente(id));
create table domanda_chiusa(id INTEGER PRIMARY KEY AUTOINCREMENT, questionario INTEGER NOT NULL, testo TEXT NOT NULL, min INTEGER NOT NULL, max INTEGER NOT NULL, posizione INTEGER NOT NULL, FOREIGN KEY(questionario) REFERENCES questionario(id));
create table domanda_aperta(id INTEGER PRIMARY KEY AUTOINCREMENT, questionario INTEGER NOT NULL, testo TEXT NOT NULL, obbligatorio INTEGER NOT NULL, posizione INTEGER NOT NULL, FOREIGN KEY(questionario) REFERENCES questionario(id));
create table opzione(id INTEGER PRIMARY KEY AUTOINCREMENT, domanda INTEGER NOT NULL, testo TEXT NOT NULL, FOREIGN KEY(domanda) REFERENCES domanda_chiusa(id));
create table compilazione(id INTEGER PRIMARY KEY AUTOINCREMENT, questionario INTEGER NOT NULL, nome TEXT NOT NULL, FOREIGN KEY(questionario) REFERENCES questionario(id));
create table risposta_chiusa(compilazione INTEGER, opzione INTEGER, selezione INTEGER NOT NULL, PRIMARY KEY (compilazione, opzione), FOREIGN KEY(compilazione) REFERENCES compilazione(id), FOREIGN KEY(opzione) REFERENCES opzione(id));
create table risposta_aperta(compilazione INTEGER, domanda INTEGER, testo TEXT NOT NULL, PRIMARY KEY (compilazione, domanda), FOREIGN KEY(compilazione) REFERENCES compilazione(id), FOREIGN KEY(domanda) REFERENCES domanda(id));

insert into utente values(null, "AlbInit", "$2a$10$I.BBJUQVfyDHEkx.1/IfludL9e.AVHXGp/P2x6i0amYu5q3BgtFt6");
insert into utente values(null, "SonSon", "$2a$10$yBLpMY5nylADKpwR7vmrfOZHxGyx97QqUCKImfjY1gMypeeHoqM/i");