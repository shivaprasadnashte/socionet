
import jwt from "jsonwebtoken";

const generatetoken = (_id) => {
  return jwt.sign({ _id }, process.env.JWT_SECRET, {
    expiresIn: "9D",
  });
};
export default generatetoken;
