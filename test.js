const bcrypt = require('bcrypt');

// Hashing a password with bcrypt
async function hashPassword(password){
   const hardcodedPassword = 'testpassword';
   const hashedPassword = await bcrypt.hash(hardcodedPassword, 10);
   console.log('Hashed Password:', hashedPassword);

   const passwordMatch = await bcrypt.compare(hardcodedPassword, hashedPassword);
   console.log('Password Match for Hardcoded Password:', passwordMatch);
}

hashPassword();
