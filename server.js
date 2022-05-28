/* back-end JavaScript for Note Taker */
const express = require('express');

const app = express();
const PORT = 3001;
const path = require('path');
const db = require("./db/db.json");

/* Create a unique ID for each note.  It may not have the "-" characters
 * provided by uuidv4.  Replace them with underscores.  */
const { v4: uuidv4 } = require("uuid");
const replace_minus = new RegExp("-", "g");
function unique_id () {return uuidv4().replace(replace_minus,"_");};

/* We use the file system to write out the data base when it is modified.
 */
const fs = require('fs');

/* In the initial data base provided by the assignment,
 * the one note has no ID.  Add it in case this is the first
 * time we have run the server.  We keep the unique IDs in
 * the data base so if the server is restarted the front end
 * won't have the IDs change out from under it.  */
let need_to_write = false;
for (const note of db) {
  if (note.id == null) {
    note.id = unique_id();
    need_to_write = true;
  }
}
if (need_to_write) {
  fs.writeFileSync("./db/db.json", JSON.stringify(db, null, 4));
}

/* Serve images, css files, js files from the public directory.  */
app.use(express.static('../front_end/public'));

/* Parse incoming requests with JSON payloads.  */
app.use(express.json());

/* If the front end requests "/notes", send it the notes.html file.  
 */
app.get("/notes", (req, res) =>
  res.sendFile(path.join(__dirname, "../front_end/public/notes.html")));

/* If the front end requests "api/notes", send it the existing
 * notes as a JSON-formatted string.  */
app.get("/api/notes", (req, res) =>
  res.json(db));

/* If the front end creates a note, store it in the data base
 * and return the note with its ID.  */
app.post("/api/notes", (req, res) => {
  const new_note = req.body;
  new_note.id = unique_id();
  db.push(new_note);
  res.json(new_note);
  fs.writeFileSync("./db/db.json", JSON.stringify(db, null, 4));
});

/* If the front end asks to delete a note, delete it
 * from the data base and return the updated data base.
 * The note to delete is identified by its ID.  */
app.delete("/api/notes/:id", (req, res) => {
  const id = req.params.id;
  let db_changed = false;
  for (let i = 0; i < db.length; i++) {
    const note = db[i];
    if (note.id == id) {
      db.splice(i, 1);
      db_changed = true;
    }
  }
  if (db_changed) {
    fs.writeFileSync("./db/db.json", JSON.stringify(db, null, 4));
  }
  res.json(db);
});

/* Listen for requests from the front end.  */
app.listen(PORT, () =>
  console.log(`Serving static asset routes on port ${PORT}!`)
);
