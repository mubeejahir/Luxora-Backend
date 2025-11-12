

exports.getPayments = async (req, res) => {
  try {
    const payment = await req;
    console.log("payment succeeded")
    res.status(200);
  } catch (error) {
      console.log("payment cancelled")
    res.status(500)
  }
};