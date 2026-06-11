const Dog = require("../models/dog");
const User = require("../models/user");

// Error handling function for dog-related operations
const handleDogErrors = (err) => {
  console.log(err.message, err.code);
  let errors = { name: "", description: "" };

  // Mongoose Validation errors (e.g., name too short, empty fields)
  if (err.message.includes("Dog validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      if (properties.path === "name") {
        errors.name = properties.message;
      } else if (properties.path === "description") {
        errors.description = properties.message;
      } else {
        errors[properties.path] = properties.message;
      }
    });
  }

  return errors;
};

// Dog Registration: Authenticated users can register dogs awaiting adoption, providing a name and a brief description.
module.exports.register_dog_get = (req, res) => {
  res.render("register", { user: req.user });
};

module.exports.register_dog_post = async (req, res) => {
  const { name, description } = req.body;

  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId = req.user._id; // Get the authenticated user's ID from the request

  try {
    // Create a new dog entry
    const dog = await Dog.create({ name, description, registeredBy: userId });

    // Add the dog's ID to the user's registeredDogs array
    await User.findByIdAndUpdate(userId, {
      $push: { registeredDogs: dog._id },
    });

    res.status(201).json({ dog: dog._id });
  } catch (err) {
    console.log(err);
    const errors = handleDogErrors(err);
    res.status(400).json({ errors });
  }
};

// Dog Adoption: Authenticated users can adopt a dog by its ID, including a thank-you message for the original owner. Restrictions apply: a dog already adopted cannot be adopted again, and users cannot adopt dogs they registered.
module.exports.adopt_dog_get = async (req, res) => {
  const dogs = await Dog.find({
    adopted: false,
    registeredBy: { $ne: req.user._id },
  }); // Fetch dogs that are not adopted and are not registered by the logged-in user
  // get the name of the user who registered each dog
  for (let dog of dogs) {
    const user = await User.findById(dog.registeredBy);
    dog.registeredByName = user ? user.username : "Unknown";
  }
  res.render("adopt", { user: req.user, dogs: dogs, errors: {} });
};

module.exports.adopt_dog_post = async (req, res) => {
  const { dogId, thankYouMessage } = req.body;

  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId = req.user._id; // Get the authenticated user's ID from the request

  try {
    const dog = await Dog.findById(dogId);

    if (!dog) {
      return res.status(404).json({ error: "Dog not found" });
    }

    if (dog.adopted) {
      return res.status(400).json({ error: "Dog has already been adopted" });
    }

    if (dog.registeredBy.toString() === userId.toString()) {
      return res
        .status(400)
        .json({ error: "You cannot adopt a dog you registered" });
    }

    dog.adopted = true;
    dog.adoptedBy = userId;
    dog.thankYouMessage = thankYouMessage;
    await dog.save();

    await User.findByIdAndUpdate(userId, { $push: { adoptedDogs: dog._id } });

    res.status(200).json({ message: "Dog adopted successfully" });
  } catch (err) {
    console.log(err);
    const errors = handleDogErrors(err);
    res.status(400).json({ errors });
  }
};

// Removing Dogs: Owners can remove their registered dogs from the platform unless the dog has been adopted. Users cannot remove dogs registered by others.
module.exports.remove_dog_delete = async (req, res) => {
  const { id } = req.params;
  const dogId = id;

  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId = req.user._id; // Get the authenticated user's ID from the request

  try {
    const dog = await Dog.findById(dogId);

    if (!dog) {
      return res.status(404).json({ error: "Dog not found" });
    }

    if (dog.adopted) {
      return res.status(400).json({ error: "Cannot remove an adopted dog" });
    }

    if (dog.registeredBy.toString() !== userId.toString()) {
      return res
        .status(400)
        .json({ error: "You can only remove dogs you registered" });
    }

    await Dog.findByIdAndDelete(dogId);
    await User.findByIdAndUpdate(userId, { $pull: { registeredDogs: dogId } });

    res.status(200).json({ message: "Dog removed successfully" });
  } catch (err) {
    console.log(err);
    const errors = handleDogErrors(err);
    res.status(400).json({ errors });
  }
};

// Listing Registered Dogs: Authenticated users can list dogs they've registered, with support for filtering by status and pagination.
module.exports.list_registered_dogs_get = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const page = parseInt(req.query.page) || 0;
  const dogsPerPage = 3;
  const skip = page * dogsPerPage;

  const totalDogs = await Dog.countDocuments({ registeredBy: req.user._id });
  const totalPages = Math.ceil(totalDogs / dogsPerPage);
  const userId = req.user._id; // Get the authenticated user's ID from the request

  try {
    const dogs = await Dog.find({ registeredBy: userId })
      .skip(skip)
      .limit(dogsPerPage);
    res.render("registered", { dogs, page: page, totalPages: totalPages || 1 });
  } catch (err) {
    console.log(err);
    const errors = handleDogErrors(err);
    res.status(400).json({ errors });
  }
};

// Listing Adopted Dogs: Authenticated users can list dogs they've adopted, with pagination support.
module.exports.list_adopted_dogs_get = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const page = parseInt(req.query.page) || 0;
  const dogsPerPage = 3;
  const skip = page * dogsPerPage;

  const totalDogs = await Dog.countDocuments({ adoptedBy: req.user._id });
  const totalPages = Math.ceil(totalDogs / dogsPerPage);
  const userId = req.user._id; // Get the authenticated user's ID from the request

  try {
    const dogs = await Dog.find({ adoptedBy: userId })
      .skip(skip)
      .limit(dogsPerPage);
    res.render("adopted", { dogs, page: page, totalPages: totalPages || 1 });
  } catch (err) {
    console.log(err);
    const errors = handleDogErrors(err);
    res.status(400).json({ errors });
  }
};
