import bcrypt from 'bcrypt';

class PasswordHasher {
  private static SALT_ROUNDS = 10;

  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(this.SALT_ROUNDS);
    return bcrypt.hash(password, salt);
  }

  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}

export default PasswordHasher;