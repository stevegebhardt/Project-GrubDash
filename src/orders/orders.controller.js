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

  if (!dishes) {
    return next({
      status: 400,
      message: "Order must include a dish",
    });
  }

  const isArray = Array.isArray(dishes);
  if (!isArray || dishes.length === 0) {
    return next({
      status: 400,
      message: "Order must include at least 1 dish",
    });
  }

  return next();
};

const hasQuantity = (req, res, next) => {
  const { data: { dishes } = {} } = req.body;
  for (let i = 0; i < dishes.length; i++) {
    if (
      dishes[i].quantity < 1 ||
      !dishes[i].quantity ||
      !Number.isInteger(dishes[i].quantity)
    ) {
      return next({
        status: 400,
        message: `Dish ${i} must have a quantity that is an integer greater than 0`,
      });
    }
  }

  next();
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
  const foundOrder = orders.find((order) => order.id === orderId);

  if (foundOrder) {
    res.json({ data: foundOrder });
  }
  next({
    status: 404,
  });
};

const updateOrder = (req, res, next) => {
  const { orderId } = req.params;
  const foundOrder = orders.find((order) => order.id === orderId);

  const { data: { id, deliverTo, mobileNumber, status, dishes } = {} } =
    req.body;

  if (foundOrder) {
    (foundOrder.deliverTo = deliverTo),
      (foundOrder.mobileNumber = mobileNumber),
      (foundOrder.status = status),
      (foundOrder.dishes = [...dishes]);
    res.json({
      data: foundOrder,
    });
  }
};

const destroy = (req, res, next) => {
  const { orderId } = req.params;
  const foundIndex = orders.findIndex((order) => order.id === orderId);

  if (orders[foundIndex].status !== "pending") {
    return next({
      status: 400,
      message: "An order cannot be deleted unless it is pending.",
    });
  }
  orders.splice(foundIndex, 1);
  res.sendStatus(204);
};

const orderExists = (req, res, next) => {
  const { orderId } = req.params;
  const foundOrder = orders.find((order) => order.id === orderId);
  if (foundOrder) {
    return next();
  }
  next({
    status: 404,
    message: `Order ${orderId} not found`,
  });
};

const matchingIds = (req, res, next) => {
  const { orderId } = req.params;
  const { data: { id } = {} } = req.body;

  if (!id || id === orderId) {
    return next();
  }
  return next({
    status: 400,
    message: `Order id does not match route id. order: ${id}, Route: ${orderId}`,
  });
};

const checkStatus = (req, res, next) => {
  const { orderId } = req.params;
  const foundOrder = orders.find((order) => order.id === orderId);
  const { data: { status } = {} } = req.body;
  if (
    !status ||
    status.length === 0 ||
    (status !== "pending" &&
      status !== "preparing" &&
      status !== "out-for-delivery" &&
      status !== "delivered") ||
    foundOrder.status === "delivered"
  ) {
    return next({
      status: 400,
      message:
        "Order must have a status of pending, preparing, out-for-delivery, delivered",
    });
  }
  next();
};

module.exports = {
  list,
  create: [hasDeliverTo, hasMobileNum, hasDishes, hasQuantity, create],
  read,
  updateOrder: [
    orderExists,
    matchingIds,
    hasDeliverTo,
    hasMobileNum,
    hasDishes,
    hasQuantity,
    checkStatus,
    updateOrder,
  ],
  destroy: [orderExists, destroy],
};
