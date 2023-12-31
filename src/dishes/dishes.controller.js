const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

const list = (req, res, next) => {
  res.json({ data: dishes });
};

const create = (req, res, next) => {
  const { data: { name, description, price, image_url } = {} } = req.body;

  const newDish = {
    id: nextId(),
    name: name,
    description: description,
    price: price,
    image_url: image_url,
  };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
};

const hasName = (req, res, next) => {
  const { data: { name } = {} } = req.body;

  if (name && name.length > 0) {
    return next();
  }
  return next({
    status: 400,
    message: "Dish must include a name",
  });
};

const hasDescription = (req, res, next) => {
  const { data: { description } = {} } = req.body;

  if (description && description.length > 0) {
    return next();
  }
  return next({
    status: 400,
    message: "Dish must include a description",
  });
};

const hasPrice = (req, res, next) => {
  const { data: { price } = {} } = req.body;
  if (Number.isInteger(price) && price > 0) {
    return next();
  }
  return next({
    status: 400,
    message: "Dish must have a price that is an integer greater than 0",
  });
};

const hasImage = (req, res, next) => {
  const { data: { image_url } = {} } = req.body;
  if (image_url && image_url.length > 0) {
    return next();
  }
  return next({
    status: 400,
    message: "Dish must include a image_url",
  });
};

const read = (req, res, next) => {
  const { dishId } = req.params;
  const foundDish = dishes.find((dish) => dish.id === dishId);

  if (foundDish) {
    return res.json({ data: foundDish });
  }
  return next({
    status: 404,
  });
};

const dishExists = (req, res, next) => {
  const { dishId } = req.params;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  if (foundDish) {
    return next();
  }
  return next({
    status: 404,
    message: `Dish does not exist: ${dishId}.`,
  });
};

const matchingIds = (req, res, next) => {
  const { dishId } = req.params;
  const { data: { id } = {} } = req.body;

  if (!id || id === dishId) {
    return next();
  }
  return next({
    status: 400,
    message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
  });
};

const update = (req, res, next) => {
  const { dishId } = req.params;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  const { data: { id, name, description, price, image_url } = {} } = req.body;

  if (foundDish) {
    foundDish.name = name;
    foundDish.description = description;
    foundDish.price = price;
    foundDish.image_url = image_url;
    res.json({ data: foundDish });
  }
};

module.exports = {
  list,
  create: [hasName, hasDescription, hasPrice, hasImage, create],
  read,
  update: [
    dishExists,
    matchingIds,
    hasName,
    hasDescription,
    hasPrice,
    hasImage,
    update,
  ],
};
