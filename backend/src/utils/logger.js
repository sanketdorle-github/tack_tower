// logger.js
const logger = (req, res, next) => {
  const { method, url } = req;
  const timestamp = new Date().toISOString();

  console.log(`[${timestamp}] ${method} ${url}`);

  res.on("finish", () => {
    console.log(`Response Status: ${res.statusCode}`);
    console.log("_____________________________________________");
  });

  next();
};

export default logger;
