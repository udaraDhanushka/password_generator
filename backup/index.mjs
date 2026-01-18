import bcrypt from 'bcrypt';
const saltRounds = 10;
// const myPlaintextPassword = process.argv[2];
const myPlaintextPassword = 'Gampaha@!23#';

console.log('password', myPlaintextPassword)

bcrypt.genSalt(saltRounds, function(err, salt) {
    bcrypt.hash(myPlaintextPassword, salt, function(err, hash) {
      console.log('Password => ', hash)
    });
});

