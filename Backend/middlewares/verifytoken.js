import jwt from 'jsonwebtoken';


const verifyCookies = (req, res, next) => {

  const accessToken = req.cookies.accessToken;
  const refreshToken = req.cookies.refreshToken;

  if (!accessToken || !refreshToken) {
    return res.status(401).json({ message: "No tokens found" });
  }

  try {
    const decodedAccessToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    const decodedRefreshToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    req.user = decodedAccessToken;
    console.log(req.user);
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid token" });
  }
};

export {verifyCookies};