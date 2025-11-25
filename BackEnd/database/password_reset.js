const database = include('databaseConnection');

async function createResetToken(userId, token, expiresAt) {
    const sql = `
        INSERT INTO Password_Reset_Token
        (user_id, token, expires_at, used)
        VALUES
        (:user_id, :token, :expires_at, 0);
    `;

    const params = {
        user_id: userId,
        token,
        expires_at: expiresAt
    }

    try {
        const [result] = await database.query(sql, params);
        console.log(result)
        console.log("Created password reset token", result.insertId)
        return true;

    } catch (error) {
        console.log("Error creating password reset token");
        console.log(err);
        return false;
    }
}


async function findValidToken(token) {
    const sql = `
        SELECT prt.*, u.email
        FROM Password_Reset_Token prt
        JOIN user u ON prt.user_id = u.user_id
        WHERE prt.token = :token
        AND prt.used = 0
        AND prt.expires_at > NOW();
    `;

    const params = {
        token
    }

    try {
        const [result] = await database.query(sql, params);
        console.log(result)
        return result.length === 1 ? result[0] : null;
    } catch (err) {
        console.log("Error finding password reset token");
        console.log(err);
        return null;
    }
}


async function markTokenUsed(token) {
    const sql = `
        UPDATE Password_Reset_Token
        SET used = 1
        WHERE token = :token;
    `;

    const params = {
        token
    }

    try {
        const [result] = await database.query(sql, params);
        console.log("Marked token as used", result.affectedRows);
        return result.affectedRows === 1;
    } catch (error) {
        console.log("Error marking password reset token as used");
        console.log(err);
        return false;
    }
}

module.exports = {
    createResetToken,
    findValidToken,
    markTokenUsed
}