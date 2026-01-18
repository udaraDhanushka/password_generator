/* eslint-disable no-restricted-globals */
import bcrypt from 'bcryptjs';

self.onmessage = (e) => {
  const { password, saltRounds } = e.data;
  
  try {
    const salt = bcrypt.genSaltSync(saltRounds);
    const hash = bcrypt.hashSync(password, salt);
    self.postMessage({ hash });
  } catch (error) {
    self.postMessage({ error: error.message });
  }
};
