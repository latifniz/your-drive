import bcrypt from 'bcrypt';

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

export const validatePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  if(password === hashedPassword) {
    return true;
  }
  return await bcrypt.compare(password, hashedPassword);
};
