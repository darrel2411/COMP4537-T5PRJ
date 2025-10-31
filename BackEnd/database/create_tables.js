const database = include('databaseConnection');

async function createUserTypeTable() {
	const createUserTypeSQL = `
	CREATE TABLE IF NOT EXISTS user_type(
	user_type_id INT NOT NULL AUTO_INCREMENT,
	user_type VARCHAR(50) NOT NULL,
    PRIMARY KEY(user_type_id)
);
	`;

	try {
		const results = await database.query(createUserTypeSQL);
		console.log("Successfully created user type table");
		return true;
	}
	catch (err) {
		console.log("Error Creating user type table");
		console.log(err);
		return false;
	}
}

async function createUserTable() {
	const createUserSQL = `
	CREATE TABLE IF NOT EXISTS user (
	user_id INT NOT NULL AUTO_INCREMENT,
	email VARCHAR(100) NOT NULL,
	name VARCHAR(50) NOT NULL,
	password VARCHAR(100) NOT NULL,
	user_type_id INT NOT NULL,
    created_at DATE,
    updated_at DATE,
	PRIMARY KEY (user_id),
	CONSTRAINT email_unique UNIQUE (email),
	CONSTRAINT fk_user_type_User 
    FOREIGN KEY (user_type_id) REFERENCES user_type(user_type_id) 
    ON DELETE RESTRICT ON UPDATE CASCADE
);
	`;

	try {
		const results = await database.query(createUserSQL);
		console.log("Successfully created user table");
		return true;
	}
	catch (err) {
		console.log("Error Creating user tables");
		console.log(err);
		return false;
	}
}

async function createImageTable() {
	const createImageSQL = `
	CREATE TABLE IF NOT EXISTS image (
	img_id INT NOT NULL AUTO_INCREMENT,
    img_title VARCHAR(50),
    img_url VARCHAR(255),
    img_public_id VARCHAR(100),
    PRIMARY KEY (img_id)
);
	`;

	try {
		const results = await database.query(createImageSQL);
		console.log("Successfully created image table");
		return true;
	}
	catch (err) {
		console.log("Error Creating image table");
		console.log(err);
		return false;
	}
}

async function createRarestTypeTable() {
	const createRarestTypeSQL = `
	CREATE TABLE IF NOT EXISTS rarest_type(
	rarest_type_id INT NOT NULL AUTO_INCREMENT,
    rarest_type VARCHAR(50),
    score INT NOT NULL,
    PRIMARY KEY (rarest_type_id)
);
	`;

	try {
		const results = await database.query(createRarestTypeSQL);
		console.log("Successfully created rarest type table");
		return true;
	}
	catch (err) {
		console.log("Error Creating rarest type table");
		console.log(err);
		return false;
	}
}

async function createBirdTable() {
	const createBirdSQL = `
	CREATE TABLE IF NOT EXISTS bird(
	bird_id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    scientific_name VARCHAR(100),
    fun_fact VARCHAR(255),
    rarest_type_id INT NOT NULL,
    created_at DATE,
    PRIMARY KEY (bird_id),
    CONSTRAINT fk_rarest_type_Bird 
    FOREIGN KEY (rarest_type_id) REFERENCES rarest_type(rarest_type_id) 
    ON DELETE RESTRICT ON UPDATE CASCADE
);
	`;

	try {
		const results = await database.query(createBirdSQL);
		console.log("Successfully created bird table");
		return true;
	}
	catch (err) {
		console.log("Error Creating bird table");
		console.log(err);
		return false;
	}
}

async function createCollectionTable() {
	const createCollectionSQL = `
	CREATE TABLE IF NOT EXISTS collection(
	collection_id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    bird_id INT NOT NULL,
    img_id INT NOT NULL,
    PRIMARY KEY (collection_id),
    CONSTRAINT fk_collection_user FOREIGN KEY (user_id) REFERENCES user(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT fk_collection_bird FOREIGN KEY (bird_id) REFERENCES bird(bird_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT fk_collection_image FOREIGN KEY (img_id) REFERENCES image(img_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);
	`;

	try {
		const results = await database.query(createCollectionSQL);
		console.log("Successfully created collection table");
		return true;
	}
	catch (err) {
		console.log("Error Creating collection table");
		console.log(err);
		return false;
	}
}

async function createTables() {
  const creationOrder = [
    createUserTypeTable,
    createUserTable,
    createImageTable,
    createRarestTypeTable,
    createBirdTable,
    createCollectionTable,
  ];

  for (const createFn of creationOrder) {
    const success = await createFn();
    if (!success) {
      console.error("Stopping table creation due to an error.");
      break;
    }
  }

  console.log("Table creation process finished.");
}

module.exports = { createTables };