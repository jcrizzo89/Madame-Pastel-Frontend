const getMongoUri = () => {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) throw new Error('MONGODB_URI must be configured in backend/.env or the process environment');
  return uri;
};

module.exports = { getMongoUri };
