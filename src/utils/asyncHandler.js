const asyncHandler = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((error) => {
      return res
        .status(500)
        .json({ message: error.message, stack: error.stack });
    });
  };
};

export default asyncHandler;
