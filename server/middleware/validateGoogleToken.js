export const validateGoogleTokenInput = (req, res, next) => {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({ 
      success: false, 
      message: "Google credential token is required" 
    });
  }

  next(); 
};