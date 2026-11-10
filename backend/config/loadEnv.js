const path = require('path');
const dotenv = require('dotenv');

if (process.env.NODE_ENV === 'production') {
  module.exports = { parsed: {} };
} else {
  const initialPort = process.env.PORT;
  const initialFrontendUrl = process.env.FRONTEND_URL;
  const initialMongoUri = process.env.MONGODB_URI;
  const result = dotenv.config({
    path: path.resolve(__dirname, '../.env'),
    override: true
  });
  if (initialPort) {
    process.env.PORT = initialPort;
  }
  if (initialFrontendUrl) {
    process.env.FRONTEND_URL = initialFrontendUrl;
  }
  if (initialMongoUri) {
    process.env.MONGODB_URI = initialMongoUri;
  }
  module.exports = result;
}
