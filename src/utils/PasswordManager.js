import bcrypt from 'bcrypt';

export default class PasswordManager {
  constructor(saltRounds = 10) {
    this.saltRounds = saltRounds;
  }

  async hashPassword(plainPassword) {
    return bcrypt.hash(plainPassword, this.saltRounds);
  }

  async comparePassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
