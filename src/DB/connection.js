import mongoose from "mongoose";

const connection = async () => {
  return await mongoose
    .connect(process.env.DATABASE)
    .then(() => {
      console.log("connected to DB");
    })
    .catch((error) => {
      console.log(error);
    });
};

export default connection;
