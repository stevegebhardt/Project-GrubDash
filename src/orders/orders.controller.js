const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
const list = (req, res, next) => {
  res.json({ data: orders });
};

const hasDeliverTo = (req, res, next) => {
  const { data: { deliverTo } = {} } = req.body;

  if (deliverTo && deliverTo.length > 0) {
    return next();
  }
  next({
    status: 400,
    message: "Order must include a deliverTo",
  });
};

const hasMobileNum = (req, res, next) => {
  const { data: { mobileNumber } = {} } = req.body;

  if (mobileNumber && mobileNumber.length > 0) {
    return next();
  }
  next({
    status: 400,
    message: "Order must include a mobileNumber",
  });
};

const hasDishes = (req, res, next) => {
  const { data: { dishes } = {} } = req.body;

  if (typeof dishes !== array || dishes.length === 0) {
    next({
      status: 400,
      message: "Order must include at least one dish",
    });
  } else if (!dishes) {
    next({
      status: 400,
      message: "Order must include a dish",
    });
  } else next();
};

const hasQuantity = (req, res, next) => {
  const { data: { dishes } = [] } = req.body;
  const positiveQuantity = dishes.filter((dish) => dish.quantity > 0);

  if (!positiveQuantity) {
    next({
      status: 400,
      message: `Dish ${index} must have a quantity that is an integer greater than 0`,
    });
  }
};

const create = (req, res, next) => {
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
  const newOrder = {
    id: nextId(),
    deliverTo: deliverTo,
    mobileNumber: mobileNumber,
    status: status,
    dishes: [...dishes],
  };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
};

const read = (req, res, next) => {
  const { orderId } = req.params;
  const foundOrder = orders.find((order) => order.id === Number(orderId));
  if (foundOrder) {
    res.json({ data: foundOrder });
  }
  next({
    status: 404,
  });
};

const updateOrder = (req, res, next) => {
  const { orderId } = req.params;
  const foundOrder = orders.find((order) => order.id === Number(orderId));

  const { data: { id, deliverTo, mobileNumber, status, dishes } = {} } =
    req.body;
  console.log("dishes", dishes);

  if (orderId !== id) {
    next({
      message: `Order id does not match route id. Order: ${id}, Route: ${orderId}.`,
    });
  } else if (status === delivered) {
    next({
      message: "A delivered order cannot be changed",
    });
  } else if (!status) {
    next({
      message:
        "Order must have a status of pending, preparing, out-for-delivery, delivered",
    });
  } else if (foundOrder) {
    (foundOrder.deliverTo = deliverTo),
      (foundOrder.mobileNumber = mobileNumber),
      (foundOrder.status = status),
      (foundOrder.dishes = [...dishes]);
    res.json({
      data: foundOrder,
    });
  } else {
    next({
      status: 404,
      message: "Order does not exist",
    });
  }
};

const destroy = (req, res, next) => {
  const { orderId } = req.params;
  const foundIndex = orders.findIndex((order) => order.id === Number(orderId));

  if (foundIndex > -1 && orders[foundIndex].status !== pending) {
    next({
      status: 400,
      message: "An order cannot be deleted unless it is pending.",
    });
  } else if (!foundIndex) {
    next({
      status: 404,
      message: "Order not found",
    });
  } else {
    orders.splice(foundIndex, 1);
    res.sendStatus(204);
  }
};

module.exports = {
  list,
  create: [hasDeliverTo, hasMobileNum, hasDishes, hasQuantity, create],
  read,
  updateOrder: [
    hasDeliverTo,
    hasMobileNum,
    hasDishes,
    hasQuantity,
    updateOrder,
  ],
  destroy,
};
