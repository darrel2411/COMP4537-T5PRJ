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
    img_id INT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    api_consumption INT DEFAULT 0,
    score INT DEFAULT 0,
	PRIMARY KEY (user_id),
	CONSTRAINT email_unique UNIQUE (email),
	CONSTRAINT fk_user_type_User 
    FOREIGN KEY (user_type_id) REFERENCES user_type(user_type_id) 
    ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_profile_picture 
    FOREIGN KEY (img_id) REFERENCES image(img_id) 
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

async function createRareTypeTable() {
	const createRareTypeSQL = `
	CREATE TABLE IF NOT EXISTS rare_type(
	rare_type_id INT NOT NULL AUTO_INCREMENT,
    rare_type VARCHAR(50),
    score INT NOT NULL,
    PRIMARY KEY (rare_type_id)
);
	`;

	try {
		const results = await database.query(createRareTypeSQL);
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
    rare_type_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (bird_id),
    CONSTRAINT fk_rare_type_Bird 
    FOREIGN KEY (rare_type_id) REFERENCES rare_type(rare_type_id) 
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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
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

async function createMethodTable() {
	const createMethodSQL = `
	CREATE TABLE IF NOT EXISTS method(
	method_id INT NOT NULL AUTO_INCREMENT,
    method VARCHAR(10) NOT NULL,
    PRIMARY KEY (method_id),
    UNIQUE KEY unique_method (method)
);
	`;

	try {
		const results = await database.query(createMethodSQL);
		console.log("Successfully created method table");
		return true;
	}
	catch (err) {
		console.log("Error Creating method table");
		console.log(err);
		return false;
	}
}

async function createEndpointTable() {
	const createEndpointSQL = `
	CREATE TABLE IF NOT EXISTS endpoint(
	endpoint_id INT NOT NULL AUTO_INCREMENT,
    method_id INT NOT NULL,
    endpoint VARCHAR(255) NOT NULL,
    PRIMARY KEY (endpoint_id),
    CONSTRAINT fk_endpoint_method FOREIGN KEY (method_id) REFERENCES method(method_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE KEY unique_method_endpoint (method_id, endpoint)
);
	`;

	try {
		const results = await database.query(createEndpointSQL);
		console.log("Successfully created endpoint table");
		return true;
	}
	catch (err) {
		console.log("Error Creating endpoint table");
		console.log(err);
		return false;
	}
}

async function createRequestTable() {
	const createRequestSQL = `
	CREATE TABLE IF NOT EXISTS request(
	request_id INT NOT NULL AUTO_INCREMENT,
    endpoint_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (request_id),
    CONSTRAINT fk_request_endpoint FOREIGN KEY (endpoint_id) REFERENCES endpoint(endpoint_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_request_user FOREIGN KEY (user_id) REFERENCES user(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);
	`;

	try {
		const results = await database.query(createRequestSQL);
		console.log("Successfully created request table");
		return true;
	}
	catch (err) {
		console.log("Error Creating request table");
		console.log(err);
		return false;
	}
}

async function createTables() {
  const creationOrder = [
    createUserTypeTable,
    createUserTable,
    createImageTable,
    createRareTypeTable,
    createBirdTable,
    createCollectionTable,
    createMethodTable,
    createEndpointTable,
    createRequestTable,
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