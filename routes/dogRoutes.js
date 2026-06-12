const { Router } = require('express');
const dogController = require('../controllers/dogController');
const { requireAuth } = require('../middlewares/authMiddleware');
const router = Router();

// Apply requireAuth globally to all routes inside this router file
router.use(requireAuth);

// --- Dog Registration ---
router.get('/register', dogController.register_dog_get);
router.post('/register', dogController.register_dog_post);

// --- Dog Adoption ---
router.get('/adopt', dogController.adopt_dog_get);
router.post('/adopt', dogController.adopt_dog_post);

// --- Dog Listings ---
router.get('/registered', dogController.list_registered_dogs_get);
router.get('/adopted', dogController.list_adopted_dogs_get);

// --- Dog Removal ---
router.delete('/remove/:id', dogController.remove_dog_delete);

module.exports = router;