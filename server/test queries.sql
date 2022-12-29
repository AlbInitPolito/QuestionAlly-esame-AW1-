-- SQLite

DELETE FROM questionario;
INSERT INTO questionario VALUES(null, 1, "titolo1");
INSERT INTO questionario VALUES(null, 1, "titolo2");

INSERT INTO domanda_aperta VALUES(null, 1, "domanda_aperta_1", 1, 1);
INSERT INTO domanda_chiusa VALUES(null, 1, "domanda_chiusa_1", 0, 3, 2);
INSERT INTO domanda_aperta VALUES(null, 1, "domanda_aperta_2", 0, 3);
INSERT INTO domanda_aperta VALUES(null, 1, "domanda_aperta_3", 0, 4);
INSERT INTO domanda_chiusa VALUES(null, 1, "domanda_chiusa_2", 0, 2, 5);
INSERT INTO domanda_aperta VALUES(null, 1, "domanda_aperta_4", 1, 6);
INSERT INTO domanda_chiusa VALUES(null, 1, "domanda_chiusa_3", 1, 3, 7);
INSERT INTO domanda_chiusa VALUES(null, 1, "domanda_chiusa_4", 1, 1, 8);

INSERT INTO opzione VALUES(null, 1, "opzione_1");
INSERT INTO opzione VALUES(null, 1, "opzione_2");
INSERT INTO opzione VALUES(null, 1, "opzione_3");
INSERT INTO opzione VALUES(null, 2, "opzione_1");
INSERT INTO opzione VALUES(null, 2, "opzione_2");
INSERT INTO opzione VALUES(null, 3, "opzione_1");
INSERT INTO opzione VALUES(null, 3, "opzione_2");
INSERT INTO opzione VALUES(null, 3, "opzione_3");
INSERT INTO opzione VALUES(null, 3, "opzione_4");
INSERT INTO opzione VALUES(null, 4, "opzione_1");
INSERT INTO opzione VALUES(null, 4, "opzione_2");
INSERT INTO opzione VALUES(null, 4, "opzione_3");
INSERT INTO opzione VALUES(null, 4, "opzione_4");

INSERT INTO questionario VALUES(null, 1, "titolo3");
INSERT INTO questionario VALUES(null, 1, "titolo4");
INSERT INTO questionario VALUES(null, 1, "titolo5");
INSERT INTO questionario VALUES(null, 1, "titolo6");
INSERT INTO questionario VALUES(null, 1, "titolo7");
INSERT INTO questionario VALUES(null, 1, "titolo8");
INSERT INTO questionario VALUES(null, 1, "titolo9");
INSERT INTO questionario VALUES(null, 1, "titolo10");
INSERT INTO questionario VALUES(null, 1, "titolo11");
INSERT INTO questionario VALUES(null, 1, "titolo12");
INSERT INTO questionario VALUES(null, 1, "titolo13");
INSERT INTO questionario VALUES(null, 1, "titolo14");
INSERT INTO questionario VALUES(null, 1, "titolo15");
INSERT INTO questionario VALUES(null, 1, "titolo16");
INSERT INTO questionario VALUES(null, 1, "titolo17");
INSERT INTO questionario VALUES(null, 1, "titolo18");
INSERT INTO questionario VALUES(null, 1, "titolo19");
INSERT INTO questionario VALUES(null, 1, "titolo20");
INSERT INTO questionario VALUES(null, 1, "titolo21");
INSERT INTO questionario VALUES(null, 1, "titolo22");
INSERT INTO questionario VALUES(null, 1, "titolo23");
INSERT INTO questionario VALUES(null, 1, "titolo24");
INSERT INTO questionario VALUES(null, 1, "titolo25");
INSERT INTO questionario VALUES(null, 1, "titolo26");
INSERT INTO questionario VALUES(null, 1, "titolo27");

SELECT last_insert_rowid() as id;
SELECT * FROM compilazione;
SELECT * FROM opzione;
SELECT * FROM risposta_aperta;
SELECT * FROM risposta_chiusa;
SELECT d.testo, obbligatorio, posizione, domanda, r.testo as risposta FROM domanda_aperta as d INNER JOIN risposta_aperta as r ON d.id = r.domanda WHERE compilazione=8;   
 
DELETE FROM risposta_chiusa;
DELETE FROM risposta_aperta;
DELETE FROM compilazione;
DELETE FROM domanda_aperta;
DELETE FROM opzione;
DELETE FROM domanda_chiusa;
DELETE FROM questionario;