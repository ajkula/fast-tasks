module.exports = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  res.status(err.statusCode || 500);
  console.log(err);
  switch (err.statusCode) {
    case 400:
      res.json({ message: err.message || "Bad Request", code: err.statusCode });
      break;
    case 401:
      res.json({ message: err.message || "Unauthorized", code: err.statusCode });
      break;
    case 403:
      res.json({ message: err.message || "Forbidden", code: err.statusCode });
      break;
    case 404:
      res.json({ message: err.message || "Not Found", code: err.statusCode });
      break;
    case 405:
      res.json({ message: err.message || "Methode Not Allowed", code: err.statusCode });
      break;
    default:
      res.json({ message: err.message || "Internal Server Error", code: 500 });
      break;
  }
}